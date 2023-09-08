import { Socket } from 'socket.io';

interface IPosition {
    x: number;
    y: number;
  }

export   class Player {
  socket: Socket | null = null;
  position: IPosition;
  paddleLength: number;

  constructor(position: IPosition, paddleLength: number, socket?: Socket) {
    this.position = position;
    this.paddleLength = paddleLength;
    if (socket) {
      this.socket = socket;
    }
  }
}
