import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@Injectable()
export class ChatService {
  private clients: Set<Socket> = new Set();
  private history = [];
  // private chat = new Server(8080, {});
  private roomCount = 1;
  private rooms = new Map<string, Set<Socket>>();

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

  createRoom(roomName: string): void {
    this.rooms.set(roomName, new Set());
  }

  joinRoom(roomName: string, client: Socket): void {
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room.add(client);
    }
  }

  leaveRoom(roomName: string, client: Socket): void {
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room.delete(client);
    }
  }

  getAllClients() : Set<Socket> {
    return this.clients;
  }

  getRoomClients(roomName: string): Set<Socket> {
    return this.rooms.get(roomName);
  }
}
