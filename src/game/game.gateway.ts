import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(7000, { transports: ['websocket'] })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.gameService.addClient(client);
    this.server.to(client.id).emit('connected', client.id);
  }

  handleDisconnect(client: Socket) {
    this.gameService.removeClient(client);
    this.server.emit('connection', 'disconnected');
  }

  @SubscribeMessage('start')
  handleStartMessage(client: Socket, data: any): void {
    this.gameService.startGameLoop();
  }

  @SubscribeMessage('stop')
  handleStopMessage(client: Socket, data: any): void {
    this.gameService.startGameLoop();
  }

  @SubscribeMessage('ballPosition')
  handleChattingMessage(client: Socket, data: any): void {
    // const ballPosition = this.gameService.getBallPosition();
    // this.server.to(client.id).emit('ballPosition', ballPosition);
    // return 'Hello world!';
  }
}
