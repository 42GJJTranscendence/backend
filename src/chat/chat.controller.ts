import { Body, Controller, Post } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Post('list')
  async handlePostRequest(@Body() data: any) {
    console.log(data);

    return [
      { id: 0, username: 'gyim' },
      { id: 1, username: 'junhjeon' },
    ];
  }
}
