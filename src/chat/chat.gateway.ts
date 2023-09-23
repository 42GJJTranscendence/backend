import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from './message/message.service';
import { UserService } from 'src/module/users/service/user.service';
import { ChannelService } from './channel/channel.service';
import { User } from 'src/module/users/entity/user.entity';
import { Channel } from './channel/channel.entity';
import { UserChannelService } from './user_channel/user_channel.service';
import { UserDto } from 'src/module/users/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { FriendService } from 'src/module/users/friend/friend.service';
import { Logger } from '@nestjs/common';
import { ChannelBanned } from './channel_banned/channel_banned.entity';
import { ChannelBannedService } from './channel_banned/channel_banned.service';
import { ChannelMuteService } from './channel_mute/channel_mute.service';
import { BlackListService } from 'src/module/users/black_list/black_list.service';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly userChannelService: UserChannelService,
    private readonly channelBannedService: ChannelBannedService,
    private readonly channelMuteService: ChannelMuteService,
    private readonly messageService: MessageService,
    private readonly friendService: FriendService,
    private readonly blackListService: BlackListService) { }

  @WebSocketServer()
  server: Server;

  private clients: Set<Socket> = new Set();
  private rooms = new Map<string, Set<Socket>>();

  async handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
    try {
      const user = this.authService.vaildateUserToken(token);
      client.data.user = user
      client.data.rooms = new Set<string>();
      this.clients.add(client);

      const userDto = UserDto.from(await this.userService.findOneByUsername(user.username));
      this.server.emit('res::user::connect', { id: userDto.id, username: userDto.username, imageUrl: userDto.imageUrl });
      console.log("Chat-Socket : <", user.username, "> connect Chat-Socket.")
    } catch (error) {
      console.log(error.response);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    console.log("Chat-Socket : <", userInfo.username, "> disconnect Chat-Socket");

    client.data.rooms.forEach((roomName) => {
      this.leaveRoom(client, roomName);
    });
    console.log("Chat-Socket : User leave room ", client.data.rooms);

    this.server.emit('res::user::disconnect', userInfo);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('req::user::list')
  async handleUserList(client: Socket) {
    const connectedClients = Array.from(this.clients).map((c) => ({ id: c.data.user.id, username: c.data.user.username }))
      .filter((userInfo) => userInfo.username !== client.data.user.username);
    const user = (await this.userService.findOneByUsername(client.data.user.username));

    const followingFriends = await this.friendService.findFollowingFriendsByUser(user);
    const following = Array.from(followingFriends).map((uf) => {
      const userDto = UserDto.from(uf.followedUser);

      if (connectedClients.find((userInfo) => userInfo.username === uf.followedUser.username)) {
        userDto.isConnected = true;
      }
      else {
        userDto.isConnected = false;
      }
      return userDto;
    });

    const followerFriends = await this.friendService.findFollowerFriendsByUser(user);
    const follower = Array.from(followerFriends).map((uf) => UserDto.from(uf.user));
    const connectedUserPromises = await Array.from(connectedClients).map(async (cc) => {
      const user = await this.userService.findOneByUsername(cc.username);
      if (user)
        return UserDto.from(user);
    })

    const connectedUsers = await Promise.all(connectedUserPromises);
    const blackList = await user.blackLists;
    const blackListDto = blackList.map(( bl ) => UserDto.from(bl.blackUser));
    client.emit('res::user::list', { following: following, follower: follower, publicUsers: connectedUsers, blackList: blackListDto});
  }

  @SubscribeMessage('req::room::join')
  async handleJoinChannel(client: Socket, payload: any) {
    try {
      const userInfo = { id: client.data.user.id, username: client.data.user.username };
      const channelId = payload.channelId;
      const channel = await this.channelService.findOneById(channelId);
      const user = await this.userService.findOneByUsername(client.data.user.username);

      if (await this.channelBannedService.isUserBannedFromChannel(user, channel)) {
        client.emit('res::error', 'join channel fail! (You are banned from channel)');
        return;
      }

      if (!(await this.userChannelService.isUserJoinedChannel(user.id, channel.id))) {
        if (channel.type == 'PRIVATE'
          && (payload.password == null || typeof payload.password !== 'string' || !(await bcrypt.compare(payload.password, channel.password)))) {
          client.emit('res::error', 'join channel fail!');
          console.log("Chat-Socket : <", userInfo.username, "> fail to join => {", channelId, "}");
          return;
        }
        await this.userChannelService.addUser(channel, user);
      }

      client.data.rooms.forEach((roomName) => {
        this.leaveRoom(client, roomName);
      });
      client.data.rooms = new Set();

      this.joinRoom(client, channelId);
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'join channel fail!');
    }
  }

  @SubscribeMessage('req::room::ban')
  async handleBanFromChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.findOneById(payload.channelId);
      const targetUser = await this.userService.findOneByUsername(payload.targetUsername);

      if (await this.userChannelService.isUserOwnerOfChannel(channel.id, client.data.user.id)) {
        await this.channelBannedService.addChannelBanUser(channel, targetUser);
        await this.userChannelService.removeUserFromChannel(targetUser.id, channel.id);
        const targetClient = this.findSocketByUsername(targetUser.username);
        this.leaveRoom(targetClient, payload.channelId); channel.id.toString();
        console.log("Chat-Socket : <", targetUser.username, "> banned from =>", channel.id);
      }
      else {
        client.emit('res::error', 'You are not channel host');
      }
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'Ban User Fail!');
    }
  }

  @SubscribeMessage('req::room::mute')
  async handleMuteFromChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.findOneById(payload.channelId);
      const targetUser = await this.userService.findOneByUsername(payload.targetUsername);

      if (await this.userChannelService.isUserOwnerOfChannel(channel.id, client.data.user.id)) {
        await this.channelMuteService.addChannelMuteUser(channel, targetUser);
        const targetClient = this.findSocketByUsername(targetUser.username);
        console.log("Chat-Socket : <", targetUser.username, "> muted from =>", channel.id);
      }
      else {
        client.emit('res::error', 'You are not channel host');
      }
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'Mute User Fail!');
    }
  }

  @SubscribeMessage('req::room::setOwner')
  async hanndleSetOwnner(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.findOneById(payload.channelId);
      const targetUser = await this.userService.findOneByUsername(payload.targetUsername);
      if (await this.userChannelService.isUserOwnerOfChannel(channel.id, client.data.user.id)) {
        if ((await this.userChannelService.setUserOwner(channel, targetUser)) != null) {
          console.log("Chat-Socket : <", client.data.user.username, "> give owner => ", "<", targetUser.username, ">");
          this.findSocketByUsername(targetUser.username).emit('res::room::amiOwner', { channelId: channel.id, isOwner: true });
        }
        else {
          client.emit('res::error', 'targetUser is not channel member');
        }
      }
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'set owner fail');
    }
  }

  @SubscribeMessage('req::room::amiOwner')
  async hanndleAmIOwner(client: Socket, payload: any) {
    try {
      const user = await this.userService.findOneByUsername(client.data.user.username);
      const channel = await this.channelService.findOneById(payload.channelId);
      const isOwner = await this.userChannelService.isUserOwnerOfChannel(channel.id, user.id);
      client.emit('res::room::amiOwner', { channelId: channel.id, isOwner: isOwner });
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'Check Owner fail');
    }
  }

  @SubscribeMessage('req::room::history')
  async handleMessageHistory(client: Socket, payload: any) {
    if (await this.userChannelService.isUserJoinedChannel(client.data.user.id, payload.channelId)) {
      let messageHistory = await this.messageService.findMessageHistory(payload.channelId);
      const user = await this.userService.findOneByUsername(client.data.user.username);
      const blackList = await user.blackLists;
      messageHistory = messageHistory.filter((mh) => blackList.find((bl) => bl.blackUser.username == mh.writer) == null);

      client.emit('res::room::history', messageHistory);
    }
  }

  @SubscribeMessage('req::room::leave')
  handleLeaveChannel(client: Socket, payload: any) {
    this.leaveRoom(client, payload.channelId);
  }

  @SubscribeMessage('req::room::dm')
  async handleGetDMChannel(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const targetUsername = payload.targetUsername;

    try {
      const user = await this.userService.findOneByUsername(userInfo.username);
      const targetUser = await this.userService.findOneByUsername(targetUsername);

      if (await this.blackListService.isBlackUser(targetUser.id, user.id)
      || await this.blackListService.isBlackUser(user.id, targetUser.id)) {
        client.emit('res::error', 'You are blacked!');
        return;
      }
      let channel = await this.channelService.findDirectChannelForUser(user.id, targetUser.id);
      if (channel == null) {
        channel = await this.channelService.createDirectChannelForUser(user, targetUser);
      }
      client.emit('res::room::dm', { joinedTo: channel.id });
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'Can\'t find dmChannel or create dmChannle');
    }
  }

  @SubscribeMessage('req::message::send')
  async handleSendMessage(client: Socket, payload: any) {
    const channelId = payload.channelId;
    const message = payload.content;
    const userDto = UserDto.from(await this.userService.findOneByUsername(client.data.user.username));

    try {
      const user: User = await this.userService.findOneByUsername(userDto.username);
      const channel: Channel = await this.channelService.findOneById(channelId);

      if (await this.channelMuteService.isUserMuteFromChannel(user, channel)) {
        client.emit('res::error', 'Send message Fail! ( You are muted from channel )');
        return;
      }

      if (await this.userChannelService.isUserJoinedChannel(user.id, channel.id)) {
        await this.messageService.createMessage(user, channel, message);
        client.to(channelId).emit('res::message::receive', { from: userDto, message: payload });
      }
      else
        client.emit('res::error', 'Send message Fail! ( You are not channel member )');
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'send message create fail!');
    }

    console.log("Chat-Socket : <", userDto.username, "> send message =>", payload);
  }

  @SubscribeMessage('req::user::follow')
  async handleUserFollow(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const targetUserName = payload.targetUsername;

    try {
      const user = await this.userService.findOneByUsername(userInfo.username);
      const targetUser = await this.userService.findOneByUsername(targetUserName);

      if (await this.friendService.isFollowUser(user, targetUser)) {
        client.emit('res::user::follow', 'Already followed!');
        return;
      }
      else if (targetUserName === userInfo.username) {
        client.emit('res::user::follow', 'You can\'t follow yourself!');
        return;
      }
      await this.friendService.followUser(user, targetUser);

      const targetUserSocket = this.findSocketByUsername(targetUser.username)
      if (targetUserSocket)
        targetUserSocket.emit('res::user::follow', { followedBy: UserDto.from(user) });
    } catch (error) {
      client.emit('res::error', "Follow fail!");
    }
  }

  @SubscribeMessage('req::user::unfollow')
  async handleUserUnFollow(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const targetUserName = payload.targetUsername;

    try {
      const user = await this.userService.findOneByUsername(userInfo.username);
      const targetUser = await this.userService.findOneByUsername(targetUserName);

      if (!(await this.friendService.isFollowUser(user, targetUser))) {
        client.emit('res::user::unfollow', 'Already unfollowed!');
        return;
      }
      else if (targetUserName === userInfo.username) {
        client.emit('res::user::unfollow', 'You can\'t unfollow yourself!');
        return;
      }
      await this.friendService.cancelFollowUser(user.id, targetUser.id);

      const targetUserSocket = this.findSocketByUsername(targetUser.username)
      if (targetUserSocket)
        targetUserSocket.emit('res::user::unfollow', { followedBy: UserDto.from(user) });
    } catch (error) {
      client.emit('res::error', "Unfollow fail!");
    }
  }

  @SubscribeMessage('req::user::black')
  async handleBlackUser(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const targetUserName = payload.targetUsername;

    try {
      const user = await this.userService.findOneByUsername(userInfo.username);
      const targetUser = await this.userService.findOneByUsername(targetUserName);

      if (await this.blackListService.isBlackUser(user.id, targetUser.id)) {
        client.emit('res::error', 'Already blacked!');
        return;
      }
      else if (targetUserName === userInfo.username) {
        client.emit('res::error', 'You can\'t black yourself!');
        return;
      }
      await this.blackListService.addBlackUser(user, targetUser);
      await this.friendService.cancelFollowUser(user.id, targetUser.id);
      client.emit('res::user::black', { blackedUser: UserDto.from(targetUserName)});
    } catch (error) {
      client.emit('res::error', "Black fail!");
    }
  }

  @SubscribeMessage('req::user::unblack')
  async handleUnBlackUser(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const targetUserName = payload.targetUsername;

    try {
      const user = await this.userService.findOneByUsername(userInfo.username);
      const targetUser = await this.userService.findOneByUsername(targetUserName);

      if (!(await this.blackListService.isBlackUser(user.id, targetUser.id))) {
        client.emit('res::error', 'Already unblacked!');
        return;
      }
      else if (targetUserName === userInfo.username) {
        client.emit('res::error', 'You can\'t unblack yourself!');
        return;
      }
      await this.blackListService.removeBlackUser(user.id, targetUser.id);
      client.emit('res::user::unblack', { unblackedUser: UserDto.from(targetUserName)});
    } catch (error) {
      client.emit('res::error', "unblack fail!");
    }
  }

  @SubscribeMessage('req::game::invite')
  async handleInviteGame(client: Socket, payload: any) {
    const awayUserName = payload.username;
    const awaySocket = this.findSocketByUsername(awayUserName);

    if (await this.blackListService.isBlackUser(awaySocket.data.user.id, client.data.user.id)
      || await this.blackListService.isBlackUser(client.data.user.id, awaySocket.data.user.id)) {
      client.emit('res::error', 'You are blacked!');
      return;
    }

    if (awaySocket) {
      awaySocket.emit('res::game::invite', { homeName: client.data.user.username, awayName: awayUserName });
      Logger.log("[Chat - Invite Game] Home User Name " + client.data.user.username);
      Logger.log("[Chat - Invite Game] Away User Name " + awayUserName);
    }
    else {
      Logger.error("[Chat - Invite Game] Can't Find Away User Socket");
    }
  }

  @SubscribeMessage('req::game::approve')
  async handleApproveGame(client: Socket, payload: any) {
    const homeUserName = payload.homeName;
    const homeSocket = this.findSocketByUsername(homeUserName);

    if (homeSocket) {
      homeSocket.emit('res::game::approve', { homeName: homeUserName, awayName: client.data.user.username });
      Logger.log("[Chat - Approve Game] Home User Name " + homeUserName);
      Logger.log("[Chat - Approve Game] Away User Name " + client.data.user.username);
    }
    else {
      Logger.error("[Chat - Approve Game] Can't Find Home User Socket");
    }
  }

  @SubscribeMessage('req::game::reject')
  async handleRejectGame(client: Socket, payload: any) {
    const homeUserName = payload.homeName;
    const homeSocket = this.findSocketByUsername(homeUserName);

    if (homeSocket) {
      homeSocket.emit('res::game::reject', { homeName: homeUserName, awayName: client.data.user.username });
      Logger.log("[Chat - Reject Game] Home User Name " + homeUserName);
      Logger.log("[Chat - Reject Game] Away User Name " + client.data.user.username);
    }
    else {
      Logger.error("[Chat - Reject Game] Can't Find Home User Socket");
    }
  }

  /* Methods */

  private joinRoom(client: Socket, channelId: string) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };

    if (!this.rooms.has(channelId))
      this.rooms.set(channelId, new Set());
    client.join(channelId);
    client.data.rooms.add(channelId);
    client.to(channelId).emit('res::room::join', { userInfo: userInfo, joinTo: channelId });

    console.log("Chat-Socket : <", userInfo.username, "> join room => {", channelId, "}");
  }

  private leaveRoom(client: Socket, channelId: string) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };

    client.to(channelId).emit('res::room::leave', { userInfo: userInfo, from: channelId });
    client.leave(channelId);
    client.data.rooms.delete(channelId);

    if (this.rooms.has(channelId)) {
      this.rooms.get(channelId).delete(client);
      if (this.rooms.get(channelId).size == 0)
        this.rooms.delete(channelId);
    }
    console.log("Chat-Socket : <", userInfo.username, "> leave room => {", channelId, "}");
  }

  private findSocketByUsername(username: string): Socket | null {
    for (let socket of this.clients) {
      if (socket.data && socket.data.user && socket.data.user.username === username) {
        return socket;
      }
    }
    return null;
  }
}
