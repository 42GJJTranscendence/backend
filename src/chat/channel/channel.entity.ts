import { ChannelType } from "src/common/enums";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChannel } from "./user_channel.entity";
import { User } from "src/module/users/entity/user.entity";
import { Message } from "./message.entity";
import { ChannelBanned } from "./channel_banned.entity";

@Entity('channel')
export class Channel
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @OneToMany(() => UserChannel, (userChannel) => userChannel.channel)
  userChannel: UserChannel[];

  @OneToMany(() => Message, (message) => message.channel)
  channelMessage: Message[];

  @OneToMany(() => ChannelBanned, (channelBanned) => channelBanned.channel)
  bannedUser: ChannelBanned[];
}