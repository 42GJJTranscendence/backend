import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entity/user.entity';

@Entity('Match')
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user_home: User;

    @ManyToOne(() => User)
    @JoinColumn()
    user_away: User;

    @ManyToOne(() => User)
    @JoinColumn()
    winner: User;

    @Column({ type: 'int', default: 0 })
    user_home_score: number;

    @Column({ type: 'int', default: 0 })
    user_away_score: number;

    @Column({ type: 'timestamp', nullable: true })
    start_at: Date;
}
