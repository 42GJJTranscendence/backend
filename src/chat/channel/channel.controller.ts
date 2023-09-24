import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/scurity/get-user.decorator";
import { User } from "src/module/users/entity/user.entity";
import { MessageService } from "../message/message.service";
import { create } from "domain";
import { UserChannelService } from "../user_channel/user_channel.service";
import { channel } from "diagnostics_channel";
import * as bcrypt from 'bcrypt';
import { createChannelRequestDto, joinChannelRequestDto } from "./channel.dto";
import { ChannelBannedService } from "../channel_banned/channel_banned.service";
import { ChannelType } from "src/common/enums";

@Controller('channels')
export class ChannelController {

    constructor(
        private channelService: ChannelService,
        private userChannelService: UserChannelService,
        private channelBannedService: ChannelBannedService,
    ) { }

    @Get()
    async getAllChannels() {
        const channels = await this.channelService.findAll();
        return Array.from(channels)
            .filter(c => c.type !== 'DIRECT')
            .map((c) => ({ id: c.id, title: c.title, type: c.type }));
    }

    @Get('/joined')
    @UseGuards(AuthGuard())
    async getJoindChannels(@GetUser() user: User,) {
        const channels = await this.channelService.findUserJoinedChannels(user);
        return Array.from(channels).map((c) => ({ id: c.id, title: c.title, type: c.type }));
    }

    @Post('/create')
    @UseGuards(AuthGuard())
    async createChanel(@Body() createChannelDto: createChannelRequestDto, @GetUser() user: User, @Res() res) {
        if (createChannelDto.type == 'PRIVATE' && createChannelDto.password == null)
            res.status(HttpStatus.BAD_REQUEST).send("PRIVATE type room needs password!");
        const createdChannel = await this.channelService.createChannel(createChannelDto, user);
        res.status(201).send("Created!");
    }

    @Delete('/delete/:channelId')
    @UseGuards(AuthGuard())
    async deleteChannel(@Param('channelId') channelId: number, @GetUser() user: User, @Res() res) {
        if (await this.userChannelService.isUserOwnerOfChannel(channelId, user.id)) {
            await this.channelService.deleteChannel(channelId);
            res.status(200).send("Deleted!");
        }
        else
            res.status(401).send("You are not owner of channel");
    }

    @Delete('/leave/:channelId')
    @UseGuards(AuthGuard())
    async leaveChannel(@Param('channelId') channelId: number, @GetUser() user: User, @Res() res) {
        if (await this.userChannelService.isUserJoinedChannel(user.id, channelId)
            && (await this.channelService.findOneById(channelId)).type != ChannelType.DIRECT) {
            await this.userChannelService.removeUserFromChannel(user.id, channelId);
            res.status(200).send("Leaved!");
        }
        else
            res.status(401).send("You are not member of channel");
    }

    @Post('/join')
    @UseGuards(AuthGuard())
    async joinChannel(@Body() joinChannelRequestDto: joinChannelRequestDto, @GetUser() user: User, @Res() res) {
        const channel = await this.channelService.findOneById(joinChannelRequestDto.channelId);
        if (channel == null) {
            res.status(404).send("Channel is not exit");
            return;
        }

        if (await this.channelBannedService.isUserBannedFromChannel(user, channel)) {
            res.status(403).send("You are banned from channel");
            return;
        }

        if (!(await this.userChannelService.isUserJoinedChannel(user.id, channel.id))) {
            console.log('111111');
            if (channel.type == 'PRIVATE'
                && (joinChannelRequestDto.password == null || !(await bcrypt.compare(joinChannelRequestDto.password, channel.password)))) {
                res.status(403).send("password is wrong");
                return;
            }
            await this.userChannelService.addUser(channel, user);
            res.status(201).send("Joined!");
        }
        else {
            res.status(201).send("Joined!");
        }
    }
}