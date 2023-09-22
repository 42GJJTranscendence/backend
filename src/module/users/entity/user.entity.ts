import { Channel } from 'src/chat/channel/channel.entity';  
import { ChannelBanned } from 'src/chat/channel_banned/channel_banned.entity';
import { Message } from 'src/chat/message/message.entity';
import { UserChannel } from 'src/chat/user_channel/user_channel.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Friend } from '../friend/friend.entity';
import { ChannelMute } from 'src/chat/channel_mute/channel_mute.entity';
import { BlackList } from '../black_list/black_list.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false})
  fortyTwoId: number;

  @Column({ unique: true , select: true})
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

  @OneToMany(() => ChannelMute, (channelMute) => channelMute.user)
  mutedChannel: ChannelMute[];

  @OneToMany(() => Friend, (friend) => friend.user)
  friends : Friend[];

  @OneToMany(() => Friend, (friend) => friend.followedUser)
  followedBy : Friend[];

  @OneToMany(() => BlackList, (blackList) => blackList.user)
  blackLists : BlackList[];

  @OneToMany(() => BlackList, (blackList) => blackList.blackUser)
  blackedBy : BlackList[];
}