import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@Injectable()
export class ChatService {
  private clients: Set<Socket> = new Set();
  private rooms = new Map<string, Set<Socket>>();

  addClient(client: Socket) {
    this.clients.add(client);
  }

  disconnectClient(client: Socket) {
    const userJoinedRooms = client.data.rooms;
    for (const roomName of userJoinedRooms) {
      const room = this.rooms.get(roomName);
    
      if (room) {
        room.delete(client);

        if (room.size === 0) {
          this.rooms.delete(roomName);
        }
      }
    }
    this.clients.delete(client);
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
