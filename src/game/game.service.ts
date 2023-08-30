import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  private clients: Set<Socket> = new Set();
  private ballX: number = 0;
  private ballY: number = 0;
  private ballSpeedX: number = 10;
  private ballSpeedY: number = 1;
  private moveball: NodeJS.Timer;
  private ballStatus: boolean = false;
  private playerPosition: number[] = [450, 450];

  addClient(client: Socket) {
    this.clients.add(client);
  }

  removeClient(client: Socket) {
    this.stopGameLoop();
    this.clients.delete(client);
  }

  startGameLoop() {
    if (!this.ballStatus) {
      this.moveball = setInterval(() => {
        this.updateBallPosition();
        const ballPosition = this.getBallPosition();
        this.broadcastBallPosition(ballPosition);
      }, 1000 / 60); // 60 FPS
      this.ballStatus = true;
    }
  }

  stopGameLoop() {
    if (this.ballStatus) {
      clearInterval(this.moveball);
      this.ballStatus = false;
    }
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
  movePlayerPosition(client: Socket, data: any) {
    if (data == 'up') this.playerPosition[0]--;
    else if (data == 'down') this.playerPosition[0]++;
    client.emit('playerPosition', this.playerPosition[0]);
  }
}
