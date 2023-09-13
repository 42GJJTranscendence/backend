import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatservice: ChatService) {}
  @Post('list')
  async handleListRequest(@Body() data: any) {
    console.log(data);
    return [
      { id: 0, username: 'gyim' },
      { id: 1, username: 'junhjeon' },
    ];
  }
  
  @Post('create')
  async handleCreateRequest(@Body() data: any) {
    this.chatservice.createRoom('asdf');
    this.chatservice.joinRoom('asdf', data.username);
    console.log(this.chatservice.getRoomClients('asdf'));
    return [{ roomName: 'asdf' }];
  }
}
