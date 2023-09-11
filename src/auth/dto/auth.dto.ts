export class FortyTwoTokenJsonInterface {
    message: string;
    access_token: string;
}

export class FortyTwoUserDto {
    id: number;
    login: string;
    image: {
        link: string;
    }
}

export class SignInRequestDto {
    username: string;
    password: string;
    email: string;
    fortyTwoToken: string;
}

export class LogInRequestDto {
    username : string;
    password: string;
}

export class LogInResponseDto {
    jwtAccessToken : string;
    userEmail : string;
}