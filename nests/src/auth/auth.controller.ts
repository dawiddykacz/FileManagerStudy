import { Controller, Post, Body, Res, Get, Render } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @Render('login')
  loginPage() {
    return { title: 'Logowanie' };
  }

  @Post('/register')
  async register(@Body() body: { username: string; password: string }, @Res() res: Response) {
    await this.authService.register(body.username, body.password);
    return res.redirect('/');
  }

  @Post('/login')
  async login(@Body() body: { username: string; password: string }, @Res() res: Response) {
    const token = await this.authService.login(body.username, body.password);
    res.cookie('jwt', token.access_token, { httpOnly: true });
    return res.redirect('/');
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/');
  }
}