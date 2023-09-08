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

@WebSocketGateway(8080, { namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.chatService.addClient(client);
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
