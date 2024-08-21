import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seeds/seed.module';
import { UserSeedService } from './seeds';
import { RoleSeedService } from './seeds';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const roleSeedService = app.get(RoleSeedService);
  await roleSeedService.seed();

  const userSeedService = app.get(UserSeedService);
  await userSeedService.seed();

  await app.close();
}

bootstrap();
