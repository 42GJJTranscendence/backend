import { User } from "src/module/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";

@Entity('message')
export class Message{
    @PrimaryGeneratedColumn()
    id: number; 

    @Column()
    content: string;
    
    @JoinColumn({ name: 'userlId' })
    @ManyToOne(() => User, (user) => user.userMessage)
    user: User;
    
    @JoinColumn({ name: 'channelId' })
    @ManyToOne(() => Channel, (channel) => channel.channelMessage, { onDelete: 'CASCADE' })
    channel: Channel;

    @CreateDateColumn({default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}