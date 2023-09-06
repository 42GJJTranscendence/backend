import { Socket } from 'socket.io';
import { Ball } from "./ball.model";
import { Player } from "./player.model";

export class GameSession {
    private roomName: string;
    private homePlayer: Player;
    private awayPlayer: Player;
    private moveBall: NodeJS.Timer;
    private ball: Ball = new Ball();
    private scores = { home: 0, away: 0 };
    private onGameEnd: (session: GameSession) => void;

    constructor(homeSocket: Socket, awaySocket: Socket, onGameEnd: (session: GameSession) => void) {
        this.homePlayer = new Player({ x: 400, y: 0 }, 200, homeSocket);
        this.awayPlayer = new Player({ x: 400, y: 980 }, 200, awaySocket);
        this.roomName = `game-${homeSocket.id}-${awaySocket.id}`;

        homeSocket.join(this.roomName);
        awaySocket.join(this.roomName);

        this.startGameLoop();
        this.onGameEnd = onGameEnd;
    }

    includesClient(client: Socket): boolean {
        return this.homePlayer.socket === client || this.awayPlayer.socket === client;
    }

    async startGameLoop() 
	{
		if (!this.ball.status)
		{
            setTimeout(() => {
                this.ball.setBallPostion({x: 480, y: 480});
                this.moveBall = setInterval(() => {
                    this.updateGame();
                    this.broadcastBallPosition(this.ball.getBallPosition());
                }, 1000 / 60); // 60 FPS
                this.ball.status = true;
            }, 3000);
		}
	}

	stopGameLoop() 
	{
		if (this.ball.status) 
		{
			clearInterval(this.moveBall);
			this.ball.status = false;
		}
	}

    updateGame() {
        this.checkBallBounds();
        this.updateBallPosition();
    
        if (this.ball.position.y < 0) {
            if (this.isBallCollidingWithPaddle(this.homePlayer)) {
                this.ball.speed.y *= -1;
            } else {
                this.handleScoreAndResult('home');
            }
        } else if (this.ball.position.y > 930) {
            if (this.isBallCollidingWithPaddle(this.awayPlayer)) {
                this.ball.speed.y *= -1;
            } else {
                this.handleScoreAndResult('away');
            }
        }
    }
    
    checkBallBounds() {
        if (this.ball.position.x >= 950 || this.ball.position.x <= 0) {
            this.ball.speed.x *= -1;
        }
    }
    
    updateBallPosition() {
        this.ball.position.x += this.ball.speed.x;
        this.ball.position.y += this.ball.speed.y;
    }
    
    isBallCollidingWithPaddle(player: Player): boolean {
        return this.ball.position.x > player.position.x && 
               this.ball.position.x < player.position.x + player.paddleLength;
    }
    
    handleScoreAndResult(playerType: 'home' | 'away') {
        this.ball.resetBall();
        this.stopGameLoop();
        this.scores[playerType]++;
        this.broadcastScores();
        if (this.scores[playerType] >= 3) {
            const result = playerType === 'home' ? 'win' : 'lose';
            this.homePlayer.socket.emit('game-result', result);
            this.awayPlayer.socket.emit('game-result', result === 'win' ? 'lose' : 'win');
            // 나중에 여기서 Match DB에 저장해야함
            this.onGameEnd(this);
            this.leaveRoom();
            return;
        }
        this.startGameLoop();
    }

    leaveRoom() {
        this.homePlayer.socket.leave(this.roomName);
        this.awayPlayer.socket.leave(this.roomName);
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

    broadcastBallPosition(ballPosition: { x: number; y: number }) {
        this.homePlayer.socket.emit('ballPosition', ballPosition);
        this.awayPlayer.socket.emit('ballPosition', ballPosition);
    }

    broadcastPlayerPosition() {
        this.homePlayer.socket.emit('playerPosition', [this.homePlayer.position, this.awayPlayer.position]);
        this.awayPlayer.socket.emit('playerPosition', [this.homePlayer.position, this.awayPlayer.position]);
    }

    broadcastScores() 
    {
        this.homePlayer.socket.emit('scores', this.scores);
        this.awayPlayer.socket.emit('scores', this.scores);
    }
}
