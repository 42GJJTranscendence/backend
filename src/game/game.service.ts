import { Queue } from 'src/utils/queue';
import { GameSession } from './gameSession.model';
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MatchService } from './match/match.service';
import { UserService } from 'src/module/users/service/user.service';

@Injectable()
export class GameService {
	private matchingNormalQueue: Queue<Socket> = new Queue();
	private matchingHardQueue: Queue<Socket> = new Queue();
    private gameSessions: GameSession[] = [];

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService
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

	addNormalClient(client: Socket)
	{
		Logger.log("[Game] addClient -> client socket id : " + client.id)
		Logger.log("[Game] queue size : " + this.matchingNormalQueue.size())
		if (this.matchingNormalQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.matchingNormalQueue.enqueue(client);
		this.tryMatchNormalClients();
	}

	private tryMatchNormalClients() {
		if (this.matchingNormalQueue.size() >= 2) {
			const homePlayerSocket = this.matchingNormalQueue.dequeue();
			const awayPlayerSocket = this.matchingNormalQueue.dequeue();

			const gameSession = new GameSession(homePlayerSocket, awayPlayerSocket, this.endSession, this.matchService, this.userService, 10);
			this.gameSessions.push(gameSession);
		}
	}
	
	addHardClient(client: Socket)
	{
		Logger.log("[Game] addClient -> client socket id : " + client.id)
		Logger.log("[Game] queue size : " + this.matchingHardQueue.size())
		if (this.matchingHardQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.matchingHardQueue.enqueue(client);
		this.tryMatchHardClients();
	}

	private tryMatchHardClients() {
		if (this.matchingHardQueue.size() >= 2) {
			const homePlayerSocket = this.matchingHardQueue.dequeue();
			const awayPlayerSocket = this.matchingHardQueue.dequeue();

			const gameSession = new GameSession(homePlayerSocket, awayPlayerSocket, this.endSession, this.matchService, this.userService, 20);
			this.gameSessions.push(gameSession);
		}
	}

    removeClient(client: Socket) 
	{
		if (this.matchingNormalQueue.contains(client))
		{
			this.matchingNormalQueue.remove(client);
		}
		else if (this.matchingHardQueue.contains(client))
		{
			this.matchingNormalQueue.remove(client);
		}
        this.endSessionForClient(client);
    }
	
	movePlayerPosition(client: Socket, data: any)
	{
		const session = this.gameSessions.find(session => session.includesClient(client));
		session.movePlayerPosition(client, data);
		session.broadcastPlayerPosition();
	}
}