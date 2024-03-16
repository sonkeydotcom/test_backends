import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env.stage.dev'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const getStage = configService.get('STAGE') === 'PROD'
        return {
          ssl: getStage,
          type: 'mongodb',
          useUnifiedTopology: true,
          useNewUrlParser: true,
          synchronize: true,
          database: 'i-tapp',
          port: configService.get('DB_PORT'),
          autoLoadEntities: true,
          host: configService.get('DB_HOST')
        }

      }
    }),
    
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
