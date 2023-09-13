import { User } from "src/module/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity('channel_banned')
export class ChannelBanned
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int'})
    @ManyToOne(() => User, (user) => user.bannedChannel)
    user: User;
    
    @Column({ type: 'int'})
    @ManyToOne(() => Channel, (channel) => channel.bannedUser)
    channel: Channel;

    @Column()
    until: Date;
}