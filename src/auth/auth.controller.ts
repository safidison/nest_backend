import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser, Public } from '../config';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async auth(
    @CurrentUser() user: { sub: number; email: string; username: string },
  ) {
    return { user: await this.userService.findOneById(user.sub) };
  }

  @Public()
  @Post('password/email')
  async requestPasswordReset(@Body('email') email: string): Promise<any> {
    return await this.userService.requestPasswordReset(email);
  }

  @Public()
  @Post('password/reset')
  async resetPasswordReset(
    @Body() passDto: { token: string; password: string },
  ): Promise<any> {
    return await this.userService.resetPassword(
      passDto.token,
      passDto.password,
    );
  }

  @Public()
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Générer un JWT token ici ou retourner les infos utilisateur selon tes besoins
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });

    return {
      user: user,
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
}
