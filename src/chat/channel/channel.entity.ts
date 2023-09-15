import { ChannelType } from "src/common/enums";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChannel } from "../user_channel/user_channel.entity";
import { Message } from "../message/message.entity";
import { ChannelBanned } from "../channel_banned/channel_banned.entity";

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

  @OneToMany(() => UserChannel, (userChannel) => userChannel.channel, { onDelete: 'CASCADE' })
  userChannel: UserChannel[];

  @OneToMany(() => Message, (message) => message.channel)
  channelMessage: Message[];

  @OneToMany(() => ChannelBanned, (channelBanned) => channelBanned.channel)
  bannedUser: ChannelBanned[];
}