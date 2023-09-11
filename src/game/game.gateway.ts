import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway(7000, { namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService) {}

  handleConnection(client: Socket) {
		console.log("handleConnection")
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;

    const user = this.authService.vaildateUserToken(token);

    if (user) {
      client.data.user = user;
      this.gameService.addClient(client);
    } else {
      // 토큰이 유효하지 않은 경우 연결 거부
      client.disconnect();
    }
  }
  
  handleDisconnect(client: Socket) {
    this.gameService.removeClient(client);
    console.log("client Disconnect : ", client.id)
  }

  @SubscribeMessage('player')
  async handlePlayerMessage(client: Socket, data: any): Promise<void> {
    this.gameService.movePlayerPosition(client, data);
  }
}
