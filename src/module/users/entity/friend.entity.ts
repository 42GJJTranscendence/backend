import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.friends)
      user: User;

    @ManyToOne(() => User, (user) => user.followedBy)
      followedUser: User;
}