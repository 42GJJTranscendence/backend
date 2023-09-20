import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/module/users/entity/user.entity';

@Entity('Match')
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    userHomeId: User;

    @ManyToOne(() => User)
    @JoinColumn()
    userAwayId: User;

    @ManyToOne(() => User)
    @JoinColumn()
    winnerId: User;

    @Column({ type: 'int', default: 0 })
    user_home_score: number;

    @Column({ type: 'int', default: 0 })
    user_away_score: number;

    @Column({ type: 'timestamp', nullable: true })
    start_at: Date;
}