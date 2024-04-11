import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [CoreController],
  providers: [CoreService],
  imports: [
    PassportModule,
  ]
})
export class CoreModule {}
