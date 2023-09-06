import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(7000, { namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
		console.log("handleConnection")
    this.gameService.addClient(client);
  }
  
  handleDisconnect(client: Socket) {
    this.gameService.removeClient(client);
  }

  @SubscribeMessage('player')
  async handlePlayerMessage(client: Socket, data: any): Promise<void> {
    this.gameService.movePlayerPosition(client, data);
    this.gameService.broadcastPlayerPosition();
  }
}
