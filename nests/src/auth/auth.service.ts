import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
const {getUser,userExists,addUser} = require("../legacy/data/users")

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const exists = await getUser(email)
    if (exists) throw new UnauthorizedException('User already exists');
    await addUser(email,password)
    return await getUser(email);
  }

  async login(email: string, password: string) {
    const user = await getUser(email)
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
