import { User } from "src/module/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity('user_channel')
export class UserChannel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int'})
    @ManyToOne(() => User, (user) => user.userChannel)
    user: User;
    
    @Column({ type: 'int'})
    @ManyToOne(() => Channel, (channel) => channel.userChannel)
    channel: Channel;

    @Column()
    is_owner: boolean;
}