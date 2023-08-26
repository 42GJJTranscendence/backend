import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  private ballX: number = 0;
  private ballY: number = 0;
  private ballSpeedX: number = 1;
  private ballSpeedY: number = 1;
  private clients: Set<Socket> = new Set();

  addClient(client: Socket) {
    this.clients.add(client);
  }

  removeClient(client: Socket) {
    this.clients.delete(client);
  }

  startGameLoop() {
    setInterval(() => {
      this.updateBallPosition();
      const ballPosition = this.getBallPosition();
      this.broadcastBallPosition(ballPosition);
    }, 1000 / 60); // 60 FPS
  }

  updateBallPosition() {
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    // Ball collision with walls
    if (this.ballX >= 100 || this.ballX <= 0) {
      this.ballSpeedX *= -1;
    }

    if (this.ballY >= 100 || this.ballY <= 0) {
      this.ballSpeedY *= -1;
    }
  }

  getBallPosition() {
    return { x: this.ballX, y: this.ballY };
  }

  broadcastBallPosition(ballPosition: { x: number; y: number }) {
    for (const client of this.clients) {
      client.emit('ballPosition', ballPosition);
    }
  }
}
