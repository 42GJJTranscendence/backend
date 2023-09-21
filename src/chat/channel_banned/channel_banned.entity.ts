import { User } from "src/module/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";

@Entity('channel_banned')
export class ChannelBanned
{
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn({ name: 'userId'})
    @ManyToOne(() => User, (user) => user.bannedChannel)
    user: User;
    
    @JoinColumn({ name: 'channelId'})
    @ManyToOne(() => Channel, (channel) => channel.bannedUser)
    channel: Channel;

    @Column()
    until: Date;
}