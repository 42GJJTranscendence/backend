import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entity/user.entity";
import { Repository, FindOneOptions } from "typeorm";
import { resolve } from "path";
import { UserNotFoundException } from "src/common/exception/custom.exception";

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(User)
        private userRepository : Repository<User>,
    ) {}

    async findOneByUsername(username : string) : Promise<User> {
        const user = await this.userRepository.findOne({ where : {username} });
        return Promise.resolve(user);
    }

    async createUser(user : User) : Promise<User | undefined> {
        const createdUser = await this.userRepository.save(user);
        return createdUser;
    }

    async modifyUserImageUrl(user : User, imageUrl : string) : Promise<User> {
        user.imageUrl = imageUrl;
        return this.userRepository.save(user);
    }

    async findOneByUserEmail(eMail : string) : Promise<User> {
        return await this.userRepository.findOne({ where : {eMail}})
    }
} 