import { ChannelType } from "src/common/enums";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChannel } from "./user_channel.entity";
import { User } from "src/module/users/entity/user.entity";
import { Message } from "./message.entity";

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

  @ManyToMany(() => User, (user) => user.bannedChannels)
  @JoinTable({
      name: 'chennal_banned',
      joinColumn: { name: 'chennel_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  bannedUsers: User[];

  @OneToMany(() => Message, (message) => message.channel)
  channelMessage: Message[];
}