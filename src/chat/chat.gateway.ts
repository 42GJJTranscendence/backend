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

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly userChannelService: UserChannelService,
    private readonly messageService: MessageService) { }

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
    console.log("Chat-Socket : User leave room ", client.data.rooms);
    this.server.emit('res::user::disconnect', userInfo);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('req::user::list')
  async handleUserList(client: Socket) {
    const allUserInfo = Array.from(this.clients).map((c) => ({ id: c.data.user.id, username: c.data.user.username }))
      .filter((userInfo) => userInfo.username !== client.data.user.username);
    const user = (await this.userService.findOneByUsername(client.data.user.username));

    const userFriends = user.friends;
    const following = Array.from(userFriends).map((uf) => {
      const userDto = UserDto.from(uf.followedUser);

      if (allUserInfo.find((userInfo) => userInfo.username === uf.followedUser)) {
        allUserInfo
        userDto.isConnected = true;
      }
      else
        userDto.isConnected = false;
      return userDto;
    });

    const follower = Array.from(user.followedBy).map((uf) => UserDto.from(uf.user));

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
        && ( payload.password == null || typeof payload.password !== 'string' || !(await bcrypt.compare(payload.password, channel.password))))
        {
          client.emit('res::error', 'join channel fail!');
          console.log("Chat-Socket : <", userInfo.username, "> fail to join => {", channelId, "}");
          return ;
        }
      await this.userChannelService.addUser(channel, user);
    }

    if (!this.rooms.has(channelId))
      this.rooms.set(channelId, new Set());
    client.join(channelId);
    client.data.rooms.add(channelId);
    client.to(channelId).emit('res::room::join', { userInfo : userInfo, joinTo :channelId });

    console.log("Chat-Socket : <", userInfo.username, "> join room => {", channelId, "}");
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
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    const channelId = payload.channelId;

    client.to(channelId).emit('res::room::leave', { userInfo : userInfo, from : channelId });
    client.leave(channelId);
    client.data.rooms.delete(channelId);

    if (this.rooms.has(channelId)) {
      this.rooms.get(channelId).delete(client);
      if (this.rooms.get(channelId).size == 0)
        this.rooms.delete(channelId);
    }

    console.log("Chat-Socket : <", userInfo.username, "> leave room => {", channelId, "}");
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
      client.to(channelId).emit('res::message::receive', { from : userInfo, message : payload });
    } catch (error) {
      console.log(error);
      client.emit('res::error', 'send message create fail!');
    }

    console.log("Chat-Socket : <", userInfo.username, "> send message =>", payload);
  }
}
