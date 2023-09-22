import { User } from "src/module/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";

@Entity('user_channel')
export class UserChannel {
    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn({ name: 'userId' })
    @ManyToOne(() => User, (user) => user.userChannel)
    user: User;
    
    @JoinColumn({ name: 'channelId' })
    @ManyToOne(() => Channel, (channel) => channel.userChannel, { onDelete: 'CASCADE' })
    channel: Channel;

    @Column()
    is_owner: boolean;
}