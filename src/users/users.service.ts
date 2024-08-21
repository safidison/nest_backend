// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PasswordResetToken, Role, User } from '../entities';
import { ConfigService } from '@nestjs/config';
import EmailService from '../email/email.service';

@Injectable()
export class UsersService {
  private saltOrRounds = 10;
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private configService: ConfigService,
    private mailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltOrRounds,
    );

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: userRole,
    });
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<any> {
    const users = await this.usersRepository.find();
    // Exclure le mot de passe des résultats
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    });
  }

  async findOneByUsername(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${email} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'], // Inclut les relations si nécessaire
    });
  }

  async findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'], // Inclut les relations si nécessaire
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const subject = 'Notification Email';

    try {
      const token = randomBytes(20).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const existingToken = await this.passwordResetTokenRepository.findOne({
        where: { user: user },
      });

      if (existingToken) {
        existingToken.token = token;
        existingToken.expiresAt = expiresAt;
        await this.passwordResetTokenRepository.save(existingToken);
      } else {
        await this.passwordResetTokenRepository.save({
          token,
          expiresAt,
          user,
        });
      }

      const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/password/reset/${token}`;

      await this.mailService.sendMail({
        from: this.configService.get('EMAIL_USER'),
        to: email,
        subject: subject,
        html: `<div><p>Bonjour ${user.name}</p>\n <p><a href=${resetUrl}>Réinitialisé votre compte</a></p></div>`,
      });
      return { message: 'Une mail vous est envoyé vers votre adresse email' };
    } catch (e: any) {
      return { message: e.message };
    }
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    try {
      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: { token },
        relations: ['user'],
      });

      if (!resetToken || resetToken.expiresAt < new Date()) {
        throw new Error('Token is invalid or has expired');
      }

      const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

      const user = resetToken.user;
      user.password = hashedPassword;
      await this.usersRepository.save(user);

      await this.passwordResetTokenRepository.delete(resetToken.id);
      return {
        message: 'Mot de passe réinitialiser avec succès',
      };
    } catch (e: any) {
      return { message: e.message };
    }
  }
}
