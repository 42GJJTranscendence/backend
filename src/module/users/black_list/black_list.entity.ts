import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../entity/user.entity";

@Entity('black_list')
export class BlackList {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.blackLists, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.blackedBy, { eager: true })
  blackUser: User;
}