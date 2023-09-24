import { Queue } from 'src/utils/queue';
import { GameSession } from './gameSession.model';
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MatchService } from './match/match.service';
import { UserService } from 'src/module/users/service/user.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { UserStatus } from 'src/common/enums';

@Injectable()
export class GameService {
	private normalQueue: Queue<Socket> = new Queue();
	private hardQueue: Queue<Socket> = new Queue();
	private inviteSockets: Map<string, Socket> = new Map();
    private gameSessions: GameSession[] = [];

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService,
		private readonly chatGateway: ChatGateway
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

	addInvite(client: Socket, data: any)
	{
		if (data.myPos == "home")
		{
			if (!this.inviteSockets[data.awayName])
			{
				this.inviteSockets[data.homeName] = client;
			}
			else
			{
				const gameSession = new GameSession(this.chatGateway, client, this.inviteSockets[data.awayName], this.endSession, this.matchService, this.userService, 10);
				this.gameSessions.push(gameSession);
				this.inviteSockets.delete(data.homeName);
				this.inviteSockets.delete(data.awayName);
			}
		}
		else
		{
			if (!this.inviteSockets[data.homeName])
			{
				this.inviteSockets[data.awayName] = client;
			}
			else
			{
				const gameSession = new GameSession(this.chatGateway, this.inviteSockets[data.homeName], client, this.endSession, this.matchService, this.userService, 10);
				this.gameSessions.push(gameSession);
				this.inviteSockets.delete(data.homeName);
				this.inviteSockets.delete(data.awayName);
			}
		}
	}

	addNormalClient(client: Socket)
	{
		Logger.log("[Game] addClient -> client socket id : " + client.id)
		Logger.log("[Game] queue size : " + this.normalQueue.size())
		if (this.normalQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.chatGateway.sendUserStatusUpdate(client.data.user.username, UserStatus.ONGAME);
		this.normalQueue.enqueue(client);
		this.tryMatchNormalClients();
	}

	private tryMatchNormalClients() {
		if (this.normalQueue.size() >= 2) {
			const homePlayerSocket = this.normalQueue.dequeue();
			const awayPlayerSocket = this.normalQueue.dequeue();

			const gameSession = new GameSession(this.chatGateway, homePlayerSocket, awayPlayerSocket, this.endSession, this.matchService, this.userService, 10);
			this.gameSessions.push(gameSession);
		}
	}
	
	addHardClient(client: Socket)
	{
		Logger.log("[Game] addClient -> client socket id : " + client.id)
		Logger.log("[Game] queue size : " + this.hardQueue.size())
		if (this.hardQueue.contains(client))
		{
			client.emit('error', { message: 'You are already in the queue!' });
			return;
		}
		this.chatGateway.sendUserStatusUpdate(client.data.user.username, UserStatus.ONGAME);
		this.hardQueue.enqueue(client);
		this.tryMatchHardClients();
	}

	private tryMatchHardClients() {
		if (this.hardQueue.size() >= 2) {
			const homePlayerSocket = this.hardQueue.dequeue();
			const awayPlayerSocket = this.hardQueue.dequeue();

			const gameSession = new GameSession(this.chatGateway, homePlayerSocket, awayPlayerSocket, this.endSession, this.matchService, this.userService, 20);
			this.gameSessions.push(gameSession);
		}
	}

    removeClient(client: Socket) 
	{
		if (this.normalQueue.contains(client))
		{
			this.normalQueue.remove(client);
		}
		else if (this.hardQueue.contains(client))
		{
			this.hardQueue.remove(client);
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