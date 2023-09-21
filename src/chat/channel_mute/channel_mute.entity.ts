import { User } from "src/module/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";

@Entity('channel_mute')
export class ChannelMute
{
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn({ name: 'userId'})
    @ManyToOne(() => User, (user) => user.mutedChannel)
    user: User;
    
    @JoinColumn({ name: 'channelId'})
    @ManyToOne(() => Channel, (channel) => channel.mutedUser)
    channel: Channel;

    @Column()
    until: Date;
}