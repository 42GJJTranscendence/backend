import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entity/user.entity";
import { Repository, FindOneOptions } from "typeorm";

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(User)
        private userRepository : Repository<User>,
    ) {}

    findOneByUsername(username : string) : Promise<User> {
        return this.userRepository.findOne({ where : {username} });
    }

    async createUser(user : User) : Promise<User | undefined> {
        const createdUser = await this.userRepository.save(user);
        return createdUser;
    }
} 