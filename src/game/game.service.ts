import { Queue } from 'src/utils/queue';
import { Ball } from './ball.model'
import { Player } from './player.model'
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { throws } from 'assert';
import { log } from 'console';


@Injectable()
export class GameService {
	private matchingQueue: Queue<Socket> = new Queue();
	private moveBall: NodeJS.Timer;
	private ball: Ball = new Ball();
	private homePlayer: Player = new Player({ x: 400, y: 0 }, 200);
	private awayPlayer: Player = new Player({ x: 400, y: 980 }, 200);
	private scores = { home: 0, away: 0 };
  
	addClient(client: Socket)
	{
		console.log("client socket id : " + client.id)
		console.log("queue size : " + this.matchingQueue.size())
		if (this.matchingQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.matchingQueue.enqueue(client);	
		if (this.matchingQueue.size() >= 2) {
			this.homePlayer.socket = this.matchingQueue.dequeue();
			this.awayPlayer.socket = this.matchingQueue.dequeue();
			const roomName = `game-${this.homePlayer.socket.id}-${this.awayPlayer.socket.id}`;
			
			this.homePlayer.socket.join(roomName);
			this.awayPlayer.socket.join(roomName);
			
			this.homePlayer.socket.to(roomName).emit("game-start");
			this.awayPlayer.socket.to(roomName).emit("game-start");
			
			this.startGameLoop();
		}
	}

	removeClient(client: Socket) 
	{
		this.stopGameLoop();
		this.matchingQueue.remove(client);
	}

	startGameLoop() 
	{
		if (!this.ball.status) 
		{
			this.ball.setBallPostion({x: 480, y: 480});
			this.moveBall = setInterval(() => {
				this.updateGame();
				this.broadcastBallPosition(this.ball.getBallPosition());
			}, 1000 / 60); // 60 FPS
			this.ball.status = true;
		}
	}

	updateGame()
	{
		if (this.ball.position.x >= 950 || this.ball.position.x <= 0)
		{
			this.ball.speed.x *= -1;
		}

		if (this.ball.position.y < 0)
		{
			if (this.ball.position.x > this.homePlayer.position.x 
				&& this.ball.position.x < this.homePlayer.position.x + this.homePlayer.paddleLength)
			{
				this.ball.speed.y *= -1;
			}
			else
			{
				this.stopGameLoop();
				this.scores.home++;
				this.broadcastScores();
				this.ball.resetBall(this.scores.home + this.scores.away);
			}
		}
		if (this.ball.position.y > 930)
		{
			if (this.ball.position.x > this.awayPlayer.position.x 
				&& this.ball.position.x < this.awayPlayer.position.x + this.awayPlayer.paddleLength)
			{
				this.ball.speed.y *= -1;
			}
			else
			{
				this.stopGameLoop();
				this.scores.home++;
				this.broadcastScores();
			}
		}
		this.ball.position.x += this.ball.speed.x;
		this.ball.position.y += this.ball.speed.y;
	}

	stopGameLoop() 
	{
		if (this.ball.status) 
		{
			clearInterval(this.moveBall);
			this.ball.status = false;
		}
	}

	broadcastBallPosition(ballPosition: { x: number; y: number }) {
		this.homePlayer.socket.emit('ballPosition', ballPosition);
		this.awayPlayer.socket.emit('ballPosition', ballPosition);
	}

	broadcastPlayerPosition() {
		this.homePlayer.socket.emit('playerPosition', this.homePlayer.position);
		this.awayPlayer.socket.emit('playerPosition', this.awayPlayer.position);
	}

	broadcastScores() 
	{
		this.homePlayer.socket.emit('scores', this.scores);
		this.awayPlayer.socket.emit('scores', this.scores);
	}

	movePlayerPosition(client: Socket, data: any)
	{
		if (client == this.homePlayer.socket)
		{
			if (data === 'up') this.homePlayer.position.x -= 30;
			else if (data === 'down') this.homePlayer.position.x += 30;
			if (this.homePlayer.position.x < 0) this.homePlayer.position.x = 0;
			if (this.homePlayer.position.x > 1000 - this.homePlayer.paddleLength)
				this.homePlayer.position.x = 1000 - this.homePlayer.paddleLength;
		}
		else if (client == this.awayPlayer.socket)
		{
			if (data === 'up') this.awayPlayer.position.x -= 30;
			else if (data === 'down') this.awayPlayer.position.x += 30;
			if (this.awayPlayer.position.x < 0) this.awayPlayer.position.x = 0;
			if (this.awayPlayer.position.x + this.awayPlayer.paddleLength > 1000)
				this.awayPlayer.position.x = 1000 - this.awayPlayer.paddleLength;
		}
	}
}
