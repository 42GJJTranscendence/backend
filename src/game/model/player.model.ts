interface IPosition {
  x: number;
  y: number;
}

export   class Player {
  position: IPosition;
  paddleLength: number;

  constructor(position: IPosition, paddleLength: number) {
    this.position = position;
    this.paddleLength = paddleLength;
  }
}
