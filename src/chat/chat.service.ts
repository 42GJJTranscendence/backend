import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  private clients: Set<Socket> = new Set();
  private history = [];
  addClient(client: Socket) {
    this.clients.add(client);
  }

  removeClient(client: Socket) {
    this.clients.delete(client);
  }

  addMessage(username: string, message: string) {
    this.history = [...this.history, { username, message }];
  }
  getHistory() {
    return this.history;
  }
}
