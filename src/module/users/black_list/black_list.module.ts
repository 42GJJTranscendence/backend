import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlackList } from "./black_list.entity";
import { BlackListService } from "./black_list.service";

@Module({
    imports : [TypeOrmModule.forFeature([BlackList])],
    providers : [BlackListService],
    exports : [BlackListService]
})

export class BlackListModule{}