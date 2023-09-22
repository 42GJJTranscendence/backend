import { ChannelType } from "src/common/enums";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChannel } from "../user_channel/user_channel.entity";
import { Message } from "../message/message.entity";
import { ChannelBanned } from "../channel_banned/channel_banned.entity";
import { ChannelMute } from "../channel_mute/channel_mute.entity";

@Entity('channel')
export class Channel
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @OneToMany(() => UserChannel, (userChannel) => userChannel.channel, { cascade: true })
  userChannel: UserChannel[];

  @OneToMany(() => Message, (message) => message.channel, { cascade: true })
  channelMessage: Message[];

  @OneToMany(() => ChannelBanned, (channelBanned) => channelBanned.channel, { cascade: true })
  bannedUser: ChannelBanned[];

  @OneToMany(() => ChannelMute, (channelMute) => channelMute.channel, { cascade: true })
  mutedUser: ChannelMute[];
}