import { Queue } from 'src/utils/queue';
import { GameSession } from './gameSession.model';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
	private matchingQueue: Queue<Socket> = new Queue();
    private gameSessions: GameSession[] = [];
  
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
		// 필요한 경우 매칭 진행
		this.tryMatchClients();
	}

    private tryMatchClients() {
        if (this.matchingQueue.size() >= 2) {
            const homePlayerSocket = this.matchingQueue.dequeue();
            const awayPlayerSocket = this.matchingQueue.dequeue();

            const gameSession = new GameSession(homePlayerSocket, awayPlayerSocket);
            this.gameSessions.push(gameSession);
        }
    }

    removeClient(client: Socket) {
        // 매칭 큐에서 클라이언트 제거
        this.matchingQueue.remove(client);
        
        // 해당 클라이언트를 포함하는 게임 세션을 찾아서 종료 처리 (예: 게임 포기)
        this.endSessionForClient(client);
    }


    private endSessionForClient(client: Socket) {
        const session = this.gameSessions.find(session => session.includesClient(client));
        if (session) {
            session.stopGameLoop()
            this.gameSessions = this.gameSessions.filter(s => s !== session);
        }
    }


	movePlayerPosition(client: Socket, data: any)
	{
		const session = this.gameSessions.find(session => session.includesClient(client));
		session.movePlayerPosition(client, data);
		session.broadcastPlayerPosition();
	}

	// broadcastBallPosition(ballPosition: { x: number; y: number }) {
	// 	this.homePlayer.socket.emit('ballPosition', ballPosition);
	// 	this.awayPlayer.socket.emit('ballPosition', ballPosition);
	// }

	// broadcastPlayerPosition() {
	// 	this.homePlayer.socket.emit('playerPosition', [this.homePlayer.position, this.awayPlayer.position]);
	// 	this.awayPlayer.socket.emit('playerPosition', [this.homePlayer.position, this.awayPlayer.position]);
	// }

	// broadcastScores() 
	// {
	// 	this.homePlayer.socket.emit('scores', this.scores);
	// 	this.awayPlayer.socket.emit('scores', this.scores);
	// }

	// movePlayerPosition(client: Socket, data: any)
	// {
	// 	if (client == this.homePlayer.socket)
	// 	{
	// 		if (data === 'up') this.homePlayer.position.x -= 30;
	// 		else if (data === 'down') this.homePlayer.position.x += 30;
	// 		if (this.homePlayer.position.x < 0) this.homePlayer.position.x = 0;
	// 		if (this.homePlayer.position.x > 1000 - this.homePlayer.paddleLength)
	// 			this.homePlayer.position.x = 1000 - this.homePlayer.paddleLength;
	// 	}
	// 	else if (client == this.awayPlayer.socket)
	// 	{
	// 		if (data === 'up') this.awayPlayer.position.x -= 30;
	// 		else if (data === 'down') this.awayPlayer.position.x += 30;
	// 		if (this.awayPlayer.position.x < 0) this.awayPlayer.position.x = 0;
	// 		if (this.awayPlayer.position.x + this.awayPlayer.paddleLength > 1000)
	// 			this.awayPlayer.position.x = 1000 - this.awayPlayer.paddleLength;
	// 	}
	// }
}
