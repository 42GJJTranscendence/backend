import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface IPlayerPosition {
  x: number;
  y: number;
}

@Injectable()
export class GameService {
  private clients: Set<Socket> = new Set();
  private ballX: number = 0;
  private ballY: number = 0;
  private paddleLength: number = 200;
  private ballSpeed: number = 10;
  private balldirection: number = 0.5 * Math.PI;
  private ballSpeedX: number = this.ballSpeed * Math.sin(this.balldirection);
  private ballSpeedY: number = this.ballSpeed * Math.cos(this.balldirection);
  private moveball: NodeJS.Timer;
  private ballStatus: boolean = false;
  private leftPlayerPosition = { x: 400, y: 0 };
  private rightPlayerPosition = { x: 400, y: 980 };
  private scores = { left: 0, right: 0 };
  addClient(client: Socket) {
    this.clients.add(client);
  }

  removeClient(client: Socket) {
    this.stopGameLoop();
    this.clients.delete(client);
  }

  startGameLoop() {
    if (!this.ballStatus) {
      this.setBallPosition({ x: 480, y: 480 });
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
    if (this.ballX >= 950 || this.ballX <= 0) {
      this.ballSpeedX *= -1;
    }
    if (this.ballY < 0) {
      if (
        this.ballX > this.leftPlayerPosition.x &&
        this.ballX < this.leftPlayerPosition.x + this.paddleLength
      ) {
        this.ballSpeedY *= -1;
      } else {
        this.stopGameLoop();
        this.scores.right++;
        this.broadcastScores();
      }
    }
    if (this.ballY > 970) {
      if (
        this.ballX > this.rightPlayerPosition.x &&
        this.ballX < this.rightPlayerPosition.x + this.paddleLength
      ) {
        this.ballSpeedY *= -1;
      } else {
        this.stopGameLoop();
        this.scores.left++;
        this.broadcastScores();
      }
    }
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;
  }

  getBallPosition() {
    return { x: this.ballX, y: this.ballY };
  }
  setBallPosition({ x, y }) {
    this.ballX = x;
    this.ballY = y;
  }

  broadcastBallPosition(ballPosition: { x: number; y: number }) {
    for (const client of this.clients) {
      client.emit('ballPosition', ballPosition);
    }
  }

  broadcastPlayerPosition(playerPosition: IPlayerPosition[]) {
    for (const client of this.clients) {
      client.emit('playerPosition', playerPosition);
    }
  }

  broadcastScores() {
    for (const client of this.clients) {
      client.emit('scores', this.scores);
    }
  }

  moveLeftPlayerPosition(client: Socket, data: any) {
    if (data === 'up') this.leftPlayerPosition.x -= 30;
    else if (data === 'down') this.leftPlayerPosition.x += 30;
    if (this.leftPlayerPosition.x < 0) this.leftPlayerPosition.x = 0;
    if (this.leftPlayerPosition.x + this.paddleLength > 1000)
      this.leftPlayerPosition.x = 1000 - this.paddleLength;
  }

  moveRightPlayerPosition(client: Socket, data: any) {
    if (data === 'up') this.rightPlayerPosition.x -= 30;
    else if (data === 'down') this.rightPlayerPosition.x += 30;
    if (this.rightPlayerPosition.x < 0) this.rightPlayerPosition.x = 0;
    if (this.rightPlayerPosition.x + this.paddleLength > 1000)
      this.rightPlayerPosition.x = 1000 - this.paddleLength;
  }

  getPlayerPosition(): IPlayerPosition[] {
    return [this.leftPlayerPosition, this.rightPlayerPosition];
  }
  gameEndCheck(ballPosition) {
    if (
      ballPosition.y < 0 &&
      ballPosition.x < this.leftPlayerPosition.x &&
      ballPosition.x > this.leftPlayerPosition.x + this.paddleLength
    ) {
      this.scores.left++;
      return true;
    } else if (
      ballPosition.y > 980 &&
      ballPosition.x < this.leftPlayerPosition.x &&
      ballPosition.x > this.leftPlayerPosition.x + this.paddleLength
    ) {
      this.scores.right++;
      return true;
    }
    return false;
  }
}
