import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken, Role, User } from '../entities';
import EmailService from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, PasswordResetToken])], // Importe la configuration du dépôt User
  providers: [UsersService, EmailService, ConfigService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
