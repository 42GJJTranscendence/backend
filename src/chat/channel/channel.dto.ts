import { ChannelType } from "src/common/enums";

export class createChannelRequestDto
{
    title : string;
    password? : string;
    type : ChannelType;
}

export class deleteChannelRequestDto
{
    channelId : number;
}
