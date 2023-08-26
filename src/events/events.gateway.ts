import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server } from 'http';
import { Observable, from, map } from 'rxjs';

@WebSocketGateway(8080)
export class EventsGateway {
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('events')
	onEvent(client:any, data: any): Observable<WsResponse<number>> {
		return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
	}
}
