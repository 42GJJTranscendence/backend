import { Queue } from 'src/utils/queue';
import { GameSession } from './gameSession.model';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface IPlayerPosition {
  x: number;
  y: number;
}

@Injectable()
export class GameService {
  private matchingQueue: Queue<Socket> = new Queue();
  private gameSessions: GameSession[] = [];
  private endSessionForClient(client: Socket) {
    const session = this.gameSessions.find((session) =>
      session.includesClient(client),
    );
    if (session) {
      session.stopGameLoop();
      this.gameSessions = this.gameSessions.filter((s) => s !== session);
    }
  }
  private tryMatchClients() {
    if (this.matchingQueue.size() >= 2) {
      const homePlayerSocket = this.matchingQueue.dequeue();
      const awayPlayerSocket = this.matchingQueue.dequeue();

      const gameSession = new GameSession(homePlayerSocket, awayPlayerSocket);
      this.gameSessions.push(gameSession);
    }
  }

  addClient(client: Socket) {
    console.log('client socket id : ' + client.id);
    console.log('queue size : ' + this.matchingQueue.size());
    if (this.matchingQueue.contains(client)) {
      client.emit('error', { message: 'You are already in the queue!' });
      return;
    }
    this.matchingQueue.enqueue(client);
    this.tryMatchClients();
  }

  removeClient(client: Socket) {
    this.matchingQueue.remove(client);
    this.endSessionForClient(client);
  }

  movePlayerPosition(client: Socket, data: any) {
    const session = this.gameSessions.find((session) =>
      session.includesClient(client),
    );
    session.movePlayerPosition(client, data);
    session.broadcastPlayerPosition();
  }
}
