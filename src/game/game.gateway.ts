import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(8080)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.gameService.addClient(client);
  }

  handleDisconnect(client: Socket) {
    this.gameService.removeClient(client);
  }

  @SubscribeMessage('getBallPosition')
  handleGetBallPosition(client: Socket): void {
    const ballPosition = this.gameService.getBallPosition();
    this.server.to(client.id).emit('ballPosition', ballPosition);
  }
}
