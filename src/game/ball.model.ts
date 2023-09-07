interface IPosition {
  x: number;
  y: number;
}

export class Ball {
  position: IPosition;
  v: IPosition;
  speed: number;
  status: boolean;
  direction: number;

  constructor() {
    this.position = { x: 480, y: 480 };
    this.direction = Math.PI / 2;
    this.speed = 10;
    this.v = {
      x: this.speed * Math.cos(this.direction),
      y: this.speed * Math.sin(this.direction),
    };
    this.status = false;
  }

  getBallPosition() {
    return this.position;
  }

  setBallPostion({ x, y }) {
    this.position.x = x;
    this.position.y = y;
  }

  setBallv({ x, y }) {
    this.v.x = x;
    this.v.y = y;
  }

  setBallSpeed({ speed }) {
    this.speed = speed;
  }

  resetBall() {
    this.position.x = 480;
    this.position.y = 480;
    this.direction = Math.PI / 2;
    this.v = {
      x: this.speed * Math.cos(this.direction),
      y: this.speed * Math.sin(this.direction),
    };
  }
}
