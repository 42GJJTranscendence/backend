import { User } from "src/module/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity('message')
export class Message{
    @PrimaryGeneratedColumn()
    id: number; 

    @Column()
    content: string;
    
    @Column({type: 'int'})
    @ManyToOne(() => User, (user) => user.userMessage)
    user: User;
    
    @Column({type: 'int'})
    @ManyToOne(() => Channel, (channel) => channel.channelMessage)
    channel: Channel;

    @CreateDateColumn({default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}