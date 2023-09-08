import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true})
  fortyTwoId: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  eMail: string;

  @Column({ nullable: true })
  mailValidateCode: string;

  @Column()
  imageUrl: string;
}