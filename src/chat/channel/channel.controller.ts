import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { createChannelRequestDto } from "./channel.dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/scurity/get-user.decorator";
import { User } from "src/module/users/entity/user.entity";
import { MessageService } from "../message/message.service";

@Controller('channels')
export class ChannelController {

    constructor (
        private channelService : ChannelService,
    ){}

    @Post('/create')
    @UseGuards(AuthGuard())
    async createChanel(@Body() createChannelDto : createChannelRequestDto, @GetUser() user : User, @Res() res) {
        console.log(createChannelDto);
        const createdChannel = await this.channelService.createChannel(createChannelDto, user);
        console.log(createdChannel);
        res.status(201).send("Created!");
    }

    @Get('/hihi')
    @UseGuards(AuthGuard())
    async hihi(@GetUser() user : User){return user}
}