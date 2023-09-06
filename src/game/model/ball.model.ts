interface IPosition {
  x: number;
  y: number;
}

export class Ball {
    position: IPosition;
    speed: IPosition;
    status: boolean;
  
    constructor() {
      this.position = { x: 480, y: 480 };
      this.speed = { x: 10, y: 15 };
      this.status = false;
    }

    getBallPosition()
    {
		return this.position;
    }

    setBallPostion({x, y})
    {
		this.position.x = x;
		this.position.y = y;
    }

	updateBallPosition() 
	{
		if (this.position.x >= 950 || this.position.x <= 0) 
		{
			this.speed.x *= -1;
		}
		if (this.position.y < 0)
		{

		}
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;






		if (this.position.y < 0) {
			if ( this.position.x > this.leftPlayerPosition.x && this.ballX < this.leftPlayerPosition.x + this.paddleLength) 
			{
				console.log(this.ballX, 'left paddle');
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
			console.log('right paddle');
			} else {
			this.stopGameLoop();
			this.scores.left++;
			this.broadcastScores();
			}
		}
		this.ballX += this.ballSpeedX;
		this.ballY += this.ballSpeedY;
		}
  }