import { Channel } from 'src/chat/channel/channel.entity';
import { ChannelBanned } from 'src/chat/channel/channel_banned.entity';
import { Message } from 'src/chat/channel/message.entity';
import { UserChannel } from 'src/chat/channel/user_channel.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false})
  fortyTwoId: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  eMail: string;
  
  @Column()
  imageUrl: string;

  @OneToMany(() => UserChannel, (userChannel) => userChannel.user)
  userChannel: UserChannel[];

  @OneToMany(() => Message, (message) => message.user)
  userMessage: Message[];

  @OneToMany(() => ChannelBanned, (channelBanned) => channelBanned.user)
  bannedChannel: ChannelBanned[];
}