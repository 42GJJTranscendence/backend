import { Socket } from 'socket.io';
import { Ball } from './ball.model';
import { Player } from './player.model';
import { Match } from './match/match.entity';
import { MatchService } from './match/match.service';
import { Logger } from '@nestjs/common';
import { UserService } from 'src/module/users/service/user.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { UserStatus } from 'src/common/enums';

export class GameSession {
  private roomName: string;
  private homePlayer: Player;
  private awayPlayer: Player;
  private playerName = { home: "", away: ""}
  private moveBall: NodeJS.Timer;
  private scores = { home: 0, away: 0 };
  private imgUrl = { home: "", away: "" };
  private onGameEnd: (session: GameSession) => void;
  private width: number = 1300;
  private height: number = 960;
  private paddleLength: number = 200;
  private ballSize: number = 50;
  private ball: Ball = new Ball(this.height / 2, this.width / 2);
  private matchService: MatchService;
  private userService: UserService;
  private isGameOn: boolean;
  private readonly chatGateway: ChatGateway;

  constructor(
    homeSocket: Socket,
    awaySocket: Socket,
    onGameEnd: (session: GameSession) => void,
    matchService: MatchService,
    userService: UserService,
    ballSpeed: number
  ) {
    this.homePlayer = new Player(
      { x: this.height / 2 - this.paddleLength / 2, y: 0 },
      this.paddleLength,
      homeSocket,
    );
    this.awayPlayer = new Player(
      { x: this.height / 2 - this.paddleLength / 2, y: this.width - 20 },
      this.paddleLength,
      awaySocket,
    );
    this.roomName = `game-${homeSocket.data.user.username}-${awaySocket.data.user.username}`;

    homeSocket.join(this.roomName);
    awaySocket.join(this.roomName);

    this.ball.setBallSpeed({speed: ballSpeed});
    this.startGameLoop();
    this.onGameEnd = onGameEnd;
    this.matchService = matchService;
    this.userService = userService;


    this.playerName.home = this.homePlayer.socket.data.user.username
    this.playerName.away = this.awayPlayer.socket.data.user.username
    this.initialize();

    this.homePlayer.socket.to(this.roomName).emit('res::player::join',this.playerName);
    this.awayPlayer.socket.to(this.roomName).emit('res::player::join',this.playerName);
    this.chatGateway.sendUserStatusUpdate(this.playerName.home, UserStatus.ONGAME);
    this.chatGateway.sendUserStatusUpdate(this.playerName.away, UserStatus.ONGAME);
  }

  async initialize(): Promise<void> {
    const homeUser = await this.userService.findOneByUsername(this.playerName.home);
    const awayUser = await this.userService.findOneByUsername(this.playerName.away);

    if (homeUser && awayUser) {
        this.imgUrl.home = homeUser.imageUrl;
        this.imgUrl.away = awayUser.imageUrl;
        this.homePlayer.socket.to(this.roomName).emit('res::player::img',this.imgUrl);
        this.awayPlayer.socket.to(this.roomName).emit('res::player::img',this.imgUrl);
    }
    Logger.log("[GAME] Game Start! ")
}

  includesClient(client: Socket): boolean {
    return (
      this.homePlayer.socket === client || this.awayPlayer.socket === client
    );
  }

  async startGameLoop() {
    if (!this.ball.status) {
      this.isGameOn = true;
      this.ball.setBallPostion({
        x: this.height / 2 - this.ballSize / 2,
        y: this.width / 2 - this.ballSize / 2,
      });
      setTimeout(() => {
        this.ball.setBallPostion({
          x: this.height / 2 - this.ballSize / 2,
          y: this.width / 2 - this.ballSize / 2,
        });
        this.moveBall = setInterval(() => {
          this.updateGame();
          this.broadcastBallPosition(this.ball.getBallPosition());
        }, 1000 / 60); // 60 FPS
        this.ball.status = true;
      }, 3000);
    }
  }

  // disconnect 될 때, 먼저 disconnect 된 user가 lose
  disconnectGameLoop(client: Socket) {
    if (this.isGameOn === true)
    {
      const match = client === this.homePlayer.socket ? this.makeMatch('away') : this.makeMatch('home')
      this.homePlayer.socket.emit('res::game::result', (client === this.homePlayer.socket) ? 'lose' : 'win');
      this.awayPlayer.socket.emit('res::game::result', (client === this.homePlayer.socket) ? 'win' : 'lose');
      this.chatGateway.sendUserStatusUpdate(this.playerName.home, UserStatus.ONLINE);
      this.chatGateway.sendUserStatusUpdate(this.playerName.away, UserStatus.ONLINE);
      this.matchService.createMatch(match); // DB 저장
    }
    this.stopGameLoop()
  }

  stopGameLoop() {
    if (this.ball.status) {
      clearInterval(this.moveBall);
      this.ball.status = false;
    }
  }

  updateGame() {
    this.checkBallBounds();
    if (this.ball.position.y < 0) {
      if (this.isBallCollidingWithPaddle(this.homePlayer)) {
        this.ball.direction =
          Math.PI / 2 -
          (this.ball.position.x +
            25 -
            (this.homePlayer.position.x + this.homePlayer.paddleLength / 2)) /
            (this.homePlayer.paddleLength / 2);
        this.ball.v.x = this.ball.speed * Math.cos(this.ball.direction);
        this.ball.v.y = this.ball.speed * Math.sin(this.ball.direction);
      } else {
        this.handleScoreAndResult('away');
      }
    } else if (this.ball.position.y > this.width - this.ballSize) {
      if (this.isBallCollidingWithPaddle(this.awayPlayer)) {
        // console.log(
        //   this.ball.position.x,
        //   this.awayPlayer.position.x + this.awayPlayer.paddleLength / 2,
        // );
        // console.log(
        //   this.ball.position.x -
        //     (this.awayPlayer.position.x + this.awayPlayer.paddleLength / 2),
        // );
        this.ball.direction =
          (Math.PI * 3) / 2 +
          (this.ball.position.x +
            25 -
            (this.awayPlayer.position.x + this.awayPlayer.paddleLength / 2)) /
            (this.awayPlayer.paddleLength / 2);
        this.ball.v.x = this.ball.speed * Math.cos(this.ball.direction);
        this.ball.v.y = this.ball.speed * Math.sin(this.ball.direction);
      } else {
        this.handleScoreAndResult('home');
      }
    }
    this.updateBallPosition();
  }

  checkBallBounds() {
    if (
      this.ball.position.x + this.ballSize >= this.height ||
      this.ball.position.x <= 0
    ) {
      this.ball.direction = Math.PI - this.ball.direction;
      this.ball.v.x = this.ball.speed * Math.cos(this.ball.direction);
      this.ball.v.y = this.ball.speed * Math.sin(this.ball.direction);
    }
  }

  updateBallPosition() {
    this.ball.position.x += this.ball.v.x;
    this.ball.position.y += this.ball.v.y;
  }

  isBallCollidingWithPaddle(player: Player): boolean {
    return (
      this.ball.position.x + 25 > player.position.x &&
      this.ball.position.x + 25 < player.position.x + player.paddleLength
    );
  }

  handleScoreAndResult(playerType: 'home' | 'away') {
    this.ball.resetBall();
    this.stopGameLoop();
    this.scores[playerType]++;
    this.broadcastScores();
    if (this.scores[playerType] >= 3) {
      const result = playerType === 'home' ? 'win' : 'lose';
      this.homePlayer.socket.emit('res::game::result', result);
      this.awayPlayer.socket.emit(
        'res::game::result',
        result === 'win' ? 'lose' : 'win',
      );
      this.isGameOn = false;
      const match = this.makeMatch(playerType); // DB 저장
      Logger.log("[Game] Match Info Home Id " + match.userHomeId.id + " Away Id " + match.userAwayId.id +  " <- is about to save on DB")
      this.matchService.createMatch(match);
      this.onGameEnd(this);
      this.leaveRoom();
      return;
    }
    this.startGameLoop();
  }

  makeMatch(playerType: string): Match {
    const match = new Match();
    match.start_at = new Date();
    match.userHomeId = this.homePlayer.socket.data.user;
    match.userAwayId = this.awayPlayer.socket.data.user;
    match.winnerId = playerType === 'home' ? this.homePlayer.socket.data.user : this.awayPlayer.socket.data.user
    match.user_home_score = this.scores.home;
    match.user_away_score = this.scores.away;
    return match;
  }

  leaveRoom() {
    this.homePlayer.socket.leave(this.roomName);
    this.awayPlayer.socket.leave(this.roomName);
    this.chatGateway.sendUserStatusUpdate(this.playerName.home, UserStatus.ONLINE);
    this.chatGateway.sendUserStatusUpdate(this.playerName.away, UserStatus.ONLINE);
  }

  movePlayerPosition(client: Socket, data: any) {
    if (client == this.homePlayer.socket) {
      if (data === 'up') this.homePlayer.position.x -= 30;
      else if (data === 'down') this.homePlayer.position.x += 30;
      if (this.homePlayer.position.x < 0) this.homePlayer.position.x = 0;
      if (
        this.homePlayer.position.x >
        this.height - this.homePlayer.paddleLength
      )
        this.homePlayer.position.x = this.height - this.homePlayer.paddleLength;
    } else if (client == this.awayPlayer.socket) {
      if (data === 'up') this.awayPlayer.position.x -= 30;
      else if (data === 'down') this.awayPlayer.position.x += 30;
      if (this.awayPlayer.position.x < 0) this.awayPlayer.position.x = 0;
      if (
        this.awayPlayer.position.x + this.awayPlayer.paddleLength >
        this.height
      )
        this.awayPlayer.position.x = this.height - this.awayPlayer.paddleLength;
    }
  }

  broadcastBallPosition(ballPosition: { x: number; y: number }) {
    this.homePlayer.socket.to(this.roomName).emit('res::ball::pos', ballPosition);
    this.awayPlayer.socket.to(this.roomName).emit('res::ball::pos', ballPosition);
  }

  broadcastPlayerPosition() {
    this.homePlayer.socket.to(this.roomName).emit('res::player::pos', [
      this.homePlayer.position,
      this.awayPlayer.position,
    ]);
    this.awayPlayer.socket.to(this.roomName).emit('res::player::pos', [
      this.homePlayer.position,
      this.awayPlayer.position,
    ]);
  }

  broadcastScores() {
    this.homePlayer.socket.to(this.roomName).emit('res::player::score', this.scores);
    this.awayPlayer.socket.to(this.roomName).emit('res::player::score', this.scores);
  }
}