import { User } from "../entity/user.entity";

export class UserDto {
    id: number;
    username: string;
    eMail: string;
    imageUrl: string;
    isConnected?: boolean;

    static from(user: User): UserDto {
        const userDto = new UserDto();
        userDto.id = user.id;
        userDto.username = user.username;
        userDto.eMail = user.eMail;
        userDto.imageUrl = user.imageUrl;
        return userDto;
      }
}