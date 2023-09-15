import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { createChannelRequestDto } from "./channel.dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/scurity/get-user.decorator";
import { User } from "src/module/users/entity/user.entity";
import { MessageService } from "../message/message.service";
import { create } from "domain";

@Controller('channels')
export class ChannelController {

    constructor (
        private channelService : ChannelService,
    ){}

    @Get()
    async getAllChannels() {
        const channels = await this.channelService.findAll();
        return Array.from(channels)
        .filter(c => c.type !== 'DIRECT')
        .map((c) => ({ id: c.id, title: c.title, type: c.type }));
    }

    @Get('/joined')
    @UseGuards(AuthGuard())
    async getJoindChannels(@GetUser() user : User,){
        const channels = await this.channelService.findUserJoinedChannels(user);
        return Array.from(channels).map((c) => ({ id: c.id, title: c.title, type: c.type }));
    }

    @Post('/create')
    @UseGuards(AuthGuard())
    async createChanel(@Body() createChannelDto : createChannelRequestDto, @GetUser() user : User, @Res() res) {
        if (createChannelDto.type == 'PRIVATE' && createChannelDto.password == null)
            res.status(HttpStatus.BAD_REQUEST).send("PRIVATE type room needs password!");
        const createdChannel = await this.channelService.createChannel(createChannelDto, user);
        res.status(201).send("Created!");
    }
}