import { Queue } from 'src/utils/queue';
import { GameSession } from './gameSession.model';
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MatchService } from './match/match.service';

@Injectable()
export class GameService {
	private matchingQueue: Queue<Socket> = new Queue();
    private gameSessions: GameSession[] = [];

	constructor(
		private readonly matchService: MatchService
	  ) {}
	
	// disconnect 될 때
	private endSessionForClient(client: Socket) {
		const session = this.gameSessions.find(session => session.includesClient(client));
		if (session) {
			session.disconnectGameLoop(client)
			this.gameSessions = this.gameSessions.filter(s => s !== session);
		}
	}
	
	// game이 끝날 때
	private endSession = (session: GameSession) => {
        session.stopGameLoop();
        this.gameSessions = this.gameSessions.filter(s => s !== session);
    }

	private tryMatchClients() {
		if (this.matchingQueue.size() >= 2) {
			const homePlayerSocket = this.matchingQueue.dequeue();
			const awayPlayerSocket = this.matchingQueue.dequeue();

			const gameSession = new GameSession(homePlayerSocket, awayPlayerSocket, this.endSession, this.matchService);
			this.gameSessions.push(gameSession);
		}
	}
  
	addClient(client: Socket)
	{
		Logger.log("[Game] addClient -> client socket id : " + client.id)
		Logger.log("queue size : " + this.matchingQueue.size())
		if (this.matchingQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.matchingQueue.enqueue(client);
		this.tryMatchClients();
	}

    removeClient(client: Socket) 
	{
        this.matchingQueue.remove(client);
        this.endSessionForClient(client);
    }
	
	movePlayerPosition(client: Socket, data: any)
	{
		const session = this.gameSessions.find(session => session.includesClient(client));
		session.movePlayerPosition(client, data);
		session.broadcastPlayerPosition();
	}
}