import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seed() {
    await this.roleRepository.query(
      'TRUNCATE TABLE role RESTART IDENTITY CASCADE',
    );
    const roles = [{ name: 'admin' }, { name: 'moderator' }, { name: 'user' }];

    for (const role of roles) {
      const roleExists = await this.roleRepository.findOne({
        where: { name: role.name },
      });
      if (!roleExists) {
        const newRole = this.roleRepository.create(role);
        await this.roleRepository.save(newRole);
      }
    }

    console.log('Roles seeding complete!');
  }
}
