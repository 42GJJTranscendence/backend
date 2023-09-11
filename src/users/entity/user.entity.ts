import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false})
  fortyTwoId: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  eMail: string;
  
  @Column()
  imageUrl: string;
}