import {IsEmail, IsEmpty, IsNotEmpty} from "class-validator"
export class CreateUserDto {
        @IsNotEmpty({message:"Name khong duoc de trong"})
        name: string;
        @IsNotEmpty({message:"Email khong duoc de trong"})
        @IsEmail({},{message:"Email khong dung dinh dang"})
        email: string;
        @IsNotEmpty({message:"Password khong duoc de trong"})
        password: string;
        phone: string;
        address: string;
        image: string;
    
}
