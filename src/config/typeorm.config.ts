import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';
import * as fs from 'fs';

const TYPEORM_OPTIONS: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],

  useFactory: (configService: ConfigService) => {
    //TODO: delete me
    if (!configService.get('DEV_DB_HOST'))
      throw new Error('DEV_DB_HOST is not defined');

    return {
      type: 'postgres',
      host: configService.get('DEV_DB_HOST'),
      port: 5432,
      username: configService.get('DEV_DB_USERNAME'),
      password: configService.get('DEV_DB_PASSWORD'),
      database: configService.get('DEV_DB_NAME'),
      autoLoadEntities: true,
      entities: [`${join(__dirname, '..', '**/*.entity{.ts,.js}')}`],
      synchronize: false,
      logging: false,
      ssl: {
        rejectUnauthorized: false, // use true if you have a CA cert,
        ca: fs.readFileSync(join(process.cwd(), 'certs', 'ca.crt')).toString(),
        cert: fs
          .readFileSync(join(process.cwd(), 'certs', 'client-postgres.crt'))
          .toString(),
        key: fs
          .readFileSync(join(process.cwd(), 'certs', 'client-postgres.key'))
          .toString(),
      },
    };
  },
};

export default TYPEORM_OPTIONS;
