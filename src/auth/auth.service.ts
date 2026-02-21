import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import bycrpt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/loginUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async userRegister(registerUserDto: RegisterUserDto) {
    const hash = await bycrpt.hash(registerUserDto.password, 10);
    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hash,
    });

    const payload = { sub: user._id };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async userLogin(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bycrpt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    const payload = { sub: user._id };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }

  async getProfile(userId: string) {
    return await this.userService.userDetails(userId);
  }
}
