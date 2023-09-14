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

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
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

      this.server.emit('userLogin', { id: user.id, username: user.username });
      console.log("Chat-Socket : <", user.username, "> connect Chat-Socket.")
    } catch (error) {
      console.log(error.response);
      client.disconnect();
    }
    const allUserInfo = Array.from(this.clients).map((c) => ({ id: c.data.user.id, username: c.data.user.username }));
    this.server.emit('connection', allUserInfo);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    console.log("Chat-Socket : <", userInfo.username, "> disconnect Chat-Socket");
    console.log("Chat-Socket : User leave room ", client.data.rooms);
    this.server.emit('userLogout', userInfo);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket) {
    const channelId = (Array.isArray(client.handshake.query.channelId) ? client.handshake.query.channelId[0] : client.handshake.query.channelId);
    const userInfo = { id: client.data.user.id, username: client.data.user.username };

    if (!this.rooms.has(channelId))
      this.rooms.set(channelId, new Set());

    client.join(channelId);
    client.data.rooms.add(channelId);
    client.to(channelId).emit('userJoin', userInfo, channelId);

    console.log("Chat-Socket : <", userInfo.username, "> join room => {", channelId, "}");
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket) {
    const channelId = (Array.isArray(client.handshake.query.channelId) ? client.handshake.query.channelId[0] : client.handshake.query.channelId).toString();
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    
    client.to(channelId).emit('userLeave', userInfo, channelId);
    client.leave(channelId);
    client.data.rooms.delete(channelId);

    if (this.rooms.has(channelId))
    {
      this.rooms.get(channelId).delete(client);
      if (this.rooms.get(channelId).size == 0)
        this.rooms.delete(channelId);
    }

    console.log("Chat-Socket : <", userInfo.username, "> leave room => {", channelId, "}");
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any) {
    const channelId = payload.channelId;
    const message = payload.message;

    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    client.to(channelId).emit('receiveMeesage', userInfo, payload);

    const user : User = await this.userService.findOneByUsername(userInfo.username);
    const channel : Channel = await this.channelService.findOneById(channelId);
    this.messageService.createMessage(user, channel, message);

    console.log("Chat-Socket : <", userInfo.username, "> send message =>", payload);
  }
}