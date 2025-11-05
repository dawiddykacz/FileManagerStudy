import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import options from '../ormconfig';
import { AuthModule } from './auth/auth.module';
import { BootstrapService } from './BootstrapService';
import { AppController } from './app.controller';

@Module({
  imports: [TypeOrmModule.forRoot(options), AuthModule],
  controllers: [AppController],
  providers: [BootstrapService],
})
export class AppModule {}