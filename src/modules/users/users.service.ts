import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email da ton tai: ${email}. Vui long su dung email khac`,
      );
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 1;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return { result, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async update(updateUserDto: UpdateUserDto) {
    await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
    return { message: 'Update user successfully', userUpdated: updateUserDto };
  }

  async remove(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return await this.userModel.deleteOne({ _id: id });
    } else {
      throw new BadRequestException('ID phải là một ObjectId');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email da ton tai: ${email}. Vui long su dung email khac`,
      );
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: uuidv4(),
      codeExpired: dayjs().add(1, 'minutes'),
    });

    //response
    return {
      _id: user._id,
    };

    //send email
    return {
      _id: user._id,
    };
  }
}
