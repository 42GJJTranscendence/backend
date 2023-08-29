import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  private clients: Set<Socket> = new Set();
  private ballX: number = 0;
  private ballY: number = 0;
  private ballSpeedX: number = 10;
  private ballSpeedY: number = 1;

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
    if (this.ballX >= 950 || this.ballX <= 0) {
      this.ballSpeedX *= -1;
    }

    if (this.ballY >= 950 || this.ballY <= 0) {
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
