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

	setBallSpeed({x, y})
    {
		this.speed.x = x;
		this.speed.y = y;
    }

	resetBall({score})
	{
		this.position.x = 480;
		this.position.y = 480;
		if (score % 2 == 0)
		{
			this.speed.x = 10;
			this.speed.y = 15;
		}
		else
		{
			this.speed.x = 10;
			this.speed.y = -15;
		}
	}
  }