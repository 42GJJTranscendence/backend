import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.friends, {
      eager: true
    })
      user: User;

    @ManyToOne(() => User, (user) => user.followedBy, {
      eager: true
    })
      followedUser: User;
}