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
  cors: { origin: '*'}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;

    const user = this.authService.vaildateUserToken(token);

    if (user) {
      client.data.user = user;
      this.chatService.addClient(client);

      this.server.emit('userJoined', { username: user.username });
    } else {
      // 토큰이 유효하지 않은 경우 연결 거부
      client.disconnect();
    }
    const clients = this.chatService.getAllClients();
    // const JoinedInfo = clients.map((c) => ({ id: c.data.user.id, username: 'user' /* 클라이언트 정보를 추가 */ }));
    this.server.emit('connection', 'connected');
  }

  handleDisconnect(client: Socket) {
    this.chatService.removeClient(client);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('message')
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
