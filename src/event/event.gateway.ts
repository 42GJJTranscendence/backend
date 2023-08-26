import { Logger } from '@nestjs/common'

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000'],
  },
})

export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('Gateway');

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`"Room:${room}"is generated.`);
    });
    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`"Socket:${id}" enter "Room:${room}`);
    });
    this.nsp.adapter.on('leave-room', (room, id) => {
      this.logger.log(`"Socket:${id}" leave "Room:${room}`);
    });
    this.nsp.adapter.on('delete-room', (roomName) => {
      this.logger.log(`"Room:${roomName} is deleted`);
    });

    this.logger.log('Websocket server initialized  ✅');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} socket connected`);

    socket.broadcast.emit('message', {
      message: `${socket.id} enter`,
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} socket disconnected`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ) {
    socket.broadcast.emit('message', { username: socket.id, message});
    return { username: socket.id, message };
  }
}
