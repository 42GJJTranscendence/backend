import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(7000, { namespace: 'game' })
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
    this.gameService.stopGameLoop();
  }

  @SubscribeMessage('leftplayer')
  async handleLeftPlayerMessage(client: Socket, data: any): Promise<void> {
    this.gameService.moveLeftPlayerPosition(client, data);
    this.gameService.broadcastPlayerPosition(
      this.gameService.getPlayerPosition(),
    );
  }
  @SubscribeMessage('rightplayer')
  async handleRightPlayerMessage(client: Socket, data: any): Promise<void> {
    this.gameService.moveRightPlayerPosition(client, data);
    this.gameService.broadcastPlayerPosition(
      this.gameService.getPlayerPosition(),
    );
  }
}
