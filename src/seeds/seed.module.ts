// src/seeds/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from '../entities';
import { UserSeedService } from './user-seed.service';
import { typeOrmConfigAsync } from '../config';
import { ConfigModule } from '@nestjs/config';
import { RoleSeedService } from './role-seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [UserSeedService, RoleSeedService],
})
export class SeedModule {}
