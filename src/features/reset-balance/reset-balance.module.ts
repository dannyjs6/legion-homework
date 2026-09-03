import { Module } from '@nestjs/common';
import { ResetBalanceService } from './reset-balance.service';
import { ResetBalanceController } from './reset-balance.controller';
import { BullModule } from '@nestjs/bullmq';
import { ResetBalanceProcessor } from './reset-balance.processor';
import { RESET_BALANCE_QUEUE } from './reset-balance.constants';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    BullModule.registerQueue({
      name: RESET_BALANCE_QUEUE,
    }),
  ],
  controllers: [ResetBalanceController],
  providers: [ResetBalanceService, ResetBalanceProcessor],
})
export class ResetBalanceModule {}
