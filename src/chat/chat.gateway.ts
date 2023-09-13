import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    let token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
    try {
      const user = this.authService.vaildateUserToken(token);
      client.data.user = user
      this.chatService.addClient(client);

      this.server.emit('userLogin', { id: user.id, username: user.username });
      console.log("Chat-Socket : <", user.username, "> connect Chat-Socket.")
    } catch (error) {
      console.log(error.response);
      client.disconnect();
    }
    const clients = Array.from(this.chatService.getAllClients());
    const allUserInfo = clients.map((c) => ({ id: c.data.user.id, username: c.data.user.username }));
    this.server.emit('connection', allUserInfo);
  }

  handleDisconnect(client: Socket) {
    this.chatService.removeClient(client);
    const userInfo = { id: client.data.user.id, username: client.data.user.username };
    console.log("Chat-Socket : <", userInfo.username, "> disconnect Chat-Socket");
    this.server.emit('userLogout', userInfo);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('joinDMRoom')
  joinDMRoom(client: Socket, payload: any): string {
    this.chatService.addClient(client);
    this.chatService.addMessage(payload.username, payload.message);
    this.server.emit('history', this.chatService.getHistory());
    console.log(this.chatService.getHistory());
    return 'Hello world!';
  }

  @SubscribeMessage('joinDMRoom')
  handleMessage(client: Socket, payload: any): string {
    this.chatService.addClient(client);
    this.chatService.addMessage(payload.username, payload.message);
    this.server.emit('history', this.chatService.getHistory());
    console.log(this.chatService.getHistory());
    return 'Hello world!';
  }

  joinRoom(roomName: string, client: Socket): void {
    const room = this.chatService.getRoomClients(roomName);
    if (room) {
      client.join(roomName);
      room.add(client);
    }
  }

  leaveRoom(roomName: string, client: Socket): void {
    client.leave(roomName);
    const room = this.chatService.getRoomClients(roomName);
    if (room) {
      room.delete(client);
    }
  }
}
