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

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly userChannelService: UserChannelService,
    private readonly messageService: MessageService,
    private readonly friendService: FriendService) { }

  @WebSocketServer()
  server: Server;

  private clients: Set<Socket> = new Set();
  private rooms = new Map<string, Set<Socket>>();

  handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
    try {
      const user = this.authService.vaildateUserToken(token);
      client.data.user = user
      client.data.rooms = new Set<string>();

      this.clients.add(client);

      this.server.emit('res::user::connect', { id: user.id, username: user.username });
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
    const allUserInfo = Array.from(this.clients).map((c) => ({ id: c.data.user.id, username: c.data.user.username }))
      .filter((userInfo) => userInfo.username !== client.data.user.username);
    const user = (await this.userService.findOneByUsername(client.data.user.username));

    const followingFriends = await this.friendService.findFollowingFriendsByUser(user);
    const following = Array.from(followingFriends).map((uf) => {
      const userDto = UserDto.from(uf.followedUser);

      if (allUserInfo.find((userInfo) => userInfo.username === uf.followedUser.username)) {
        userDto.isConnected = true;
      }
      else {
        userDto.isConnected = false;
      }
      return userDto;
    });

    const followerFriends = await this.friendService.findFollowerFriendsByUser(user);
    const follower = Array.from(followerFriends).map((uf) => UserDto.from(uf.user));

    client.emit('res::user::list', { following: following, follower: follower, publicUsers: allUserInfo });
  }

  @SubscribeMessage('req::room::join')
  async handleJoinChannel(client: Socket, payload: any) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const channelId = payload.channelId;
    const channel = await this.channelService.findOneById(channelId);
    const user = await this.userService.findOneByUsername(client.data.user.username);

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
  }

  @SubscribeMessage('req::room::history')
  async handleMessageHistory(client: Socket, payload: any) {
    if (this.userChannelService.isUserJoinedChannel(client.data.user.id, payload.channelId)) {
      const messageHistory = await this.messageService.findMessageHistory(payload.channelId);
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
      const targetUser= await this.userService.findOneByUsername(targetUsername);
      let channel = await this.channelService.findDirectChannelForUser(user.id, targetUser.id);
      if (channel == null) {
        channel = await this. channelService.createDirectChannelForUser(user, targetUser);
      }
      this.joinRoom(client, channel.id.toString());
      client.emit('res::room::dm', { joinedTo : channel.id});
    } catch (error) {
      console.log(error);
      client.emit('res::room::dm', 'Can\'t find dmChannel or create dmChannle');
    }
  }

  @SubscribeMessage('req::message::send')
  async handleSendMessage(client: Socket, payload: any) {
    const channelId = payload.channelId;
    const message = payload.content;
    const userInfo = { id: client.data.user.id, username: client.data.user.username };

    try {
      const user: User = await this.userService.findOneByUsername(userInfo.username);
      const channel: Channel = await this.channelService.findOneById(channelId);
      await this.messageService.createMessage(user, channel, message);
      client.to(channelId).emit('res::message::receive', { from: userInfo, message: payload });
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'send message create fail!');
    }

    console.log("Chat-Socket : <", userInfo.username, "> send message =>", payload);
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

      client.emit('res::user::follow', 'Follow success!')
    } catch (error) {
      client.emit('res::error', "Follow fail!");
    }
  }




  /* Methods */

  joinRoom(client: Socket, channelId: string) {
    const userInfo = { id: client.data.user.id, username: client.data.user.username };

    if (!this.rooms.has(channelId))
      this.rooms.set(channelId, new Set());
    client.join(channelId);
    client.data.rooms.add(channelId);
    client.to(channelId).emit('res::room::join', { userInfo: userInfo, joinTo: channelId });

    console.log("Chat-Socket : <", userInfo.username, "> join room => {", channelId, "}");
  }

  leaveRoom(client: Socket, channelId: string) {
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
}
