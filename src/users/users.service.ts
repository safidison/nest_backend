// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltOrRounds = 10;
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
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
}
