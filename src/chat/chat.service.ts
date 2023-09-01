import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@Injectable()
export class ChatService {
  private clients: Set<Socket> = new Set();
  private history = [];
  // private chat = new Server(8080, {});

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
