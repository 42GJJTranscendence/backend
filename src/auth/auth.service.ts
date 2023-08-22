import { Injectable } from "@nestjs/common";
import { User } from "src/modules/users/entity/user.entity";


@Injectable()
export class AuthService {
    async getToken(code: string, res: Response): Promise<string> {
        // console.log("now retrieving token...");
        // const body = {
        //     "grant_type": 'authorization_code',
        //     "client_id": process.env.UID,
        //     "client_secret": process.env.SECRET,
        //     "redirect_uri": process.env.CALLBACK_URI,
        //     "code": code,
        // }
        // const options = {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(body),
        // };
        // const token = await fetch("https://api.intra.42.fr/oauth/token", options)
        //     .then(async (response) => {
        //         const json = await response.json() as JsonResponseInterface;
        //         if (!response.ok) {
        //             return Promise.reject(json.message);
        //         }
        //         return json.access_token as string;
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         return '';
        //     });
        return Promise.resolve("This is the Token");
    }

    // async getUser(token: string): Promise<User | undefined> {
        
        // authenticate user with 42intra token
        // const options = {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": "Bearer " + token,
        //     },
        // };
        // return fetch("https://api.intra.42.fr/v2/me", options)
        //     .then(async (response) => {
        //         if (!response.ok) {
        //             return Promise.reject(`Error ${response.status}: Failed to get user infos`);
        //         }
        //         const json = await response.json() as GetUserDto;
        //         if (json.hasOwnProperty('id') && json.hasOwnProperty('login')) {
        //             const id42 = json.id;
        //             const username = json.login;
        //             console.log("id:", id42, "username:", username, "token:", token);
        //             // exchange intra token with jwt
        //             const secret = authenticator.generateSecret();
        //             const jwtoken = jwt.sign({userId: id42}, process.env.JWT_SECRET, {expiresIn: "3d"})
        //             return await this.logUser(id42, username, jwtoken);
        //         } else
        //             return undefined;
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         return undefined;
        //     });
    // }

    // async authenticate(code: string, res: Response): Promise<User | undefined> {
    //     const token = await this.getToken(code, res);
    //     if (token === '')
    //         return undefined;
    //     console.log("AUTH: NEW TOKEN GENERATED:", token);
    //     return this.getUser(token);
    // }
}