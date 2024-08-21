import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])], // Importe la configuration du dépôt User
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
