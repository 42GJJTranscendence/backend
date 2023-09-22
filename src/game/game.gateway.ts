import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'game',
  cors: { origin: process.env.FRONT_DOMAIN, credentials: true}
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    Logger.log("[Game] Player Socket Connect")
    // Logger.log("query : " + client.handshake.query.rule)
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
    try {
      const user = await this.authService.vaildateUserToken(token);
      Logger.log("[Game] user.id : " + user.id + " | user.username : " + user.username);
      if (user) {
          client.data.user = user;
      } else {
          // 토큰이 유효하지 않은 경우 연결 거부
          client.emit('res::game::error', {message: 'You Should Login First!'});
          client.disconnect();
      }
    } catch (error) {
      Logger.error("Error while getting user:", error);
      client.disconnect();
    }
  }
      
  handleDisconnect(client: Socket) {
    Logger.log("[Game] Socket Disconnect : " + client.id);
    this.gameService.removeClient(client);
  }

  @SubscribeMessage('req::normal::join')
  async joinNormalQueue(client: Socket, data: any): Promise<void> {
    this.gameService.addNormalClient(client);
  }

  @SubscribeMessage('req::hard::join')
  async joinHardQueue(client: Socket, data: any): Promise<void> {
    this.gameService.addHardClient(client);
  }

  
  @SubscribeMessage('req::game::invite')
  async HandleInviteGame(client: Socket, data: any): Promise<void> {
    const myName = client.data.user.username;
    if (data.homeName == myName)
    {
      data.myPos = "home"
      this.gameService.addInvite(client, data);
    }
    else
    {
      data.myPos = "away"
      this.gameService.addInvite(client, data);
    }
  }

  @SubscribeMessage('req::user::move')
  async handlePlayerMessage(client: Socket, data: any): Promise<void> {
    this.gameService.movePlayerPosition(client, data);
  }
}