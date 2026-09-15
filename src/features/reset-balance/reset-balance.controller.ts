import { Controller, Post } from '@nestjs/common';
import { ResetBalanceService } from './reset-balance.service';

@Controller('reset-balance')
export class ResetBalanceController {
  constructor(private readonly resetBalanceService: ResetBalanceService) {}

  @Post('')
  async resetBalance(): Promise<void> {
    await this.resetBalanceService.resetBalance();
  }
}
