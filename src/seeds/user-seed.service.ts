import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../entities';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seed() {
    await this.userRepository.query(
      'TRUNCATE TABLE "user" RESTART IDENTITY CASCADE',
    );
    const saltOrRounds = 10;
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });
    const moderatorRole = await this.roleRepository.findOne({
      where: { name: 'moderator' },
    });
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    const users = [
      {
        username: 'admin',
        name: 'admin',
        password: 'admin',
        email: 'admin@gmail.com',
        role: adminRole,
      },
      {
        username: 'moderator',
        name: 'moderator',
        password: 'moderator',
        email: 'moderator@gmail.com',
        role: moderatorRole,
      },
      {
        username: 'user',
        name: 'user',
        password: 'user',
        email: 'user@gmail.com',
        role: userRole,
      },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltOrRounds);
      const newUser = this.userRepository.create({
        ...user,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);
    }

    console.log('Users Seeding complete!');
  }
}
