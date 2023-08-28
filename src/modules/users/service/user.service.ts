import { Injectable } from "@nestjs/common";
import { Repository, FindOneOptions } from "typeorm";
import { User } from "../entity/user.entity";
// import { UserRepository } from "../repository/user.repository";

@Injectable()
export class UserService {
    
    constructor(private userRepository : Repository<User>) {}

    async findOneByFields(conditions: FindOneOptions<User>) {
        return this.userRepository.findOne(conditions);
    }
}