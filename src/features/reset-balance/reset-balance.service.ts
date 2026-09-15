import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  RESET_BALANCE_JOB,
  RESET_BALANCE_QUEUE,
  RESET_BALANCE_SCHEDULER,
} from './reset-balance.constants';

@Injectable()
export class ResetBalanceService implements OnModuleInit {
  private readonly logger = new Logger(ResetBalanceService.name);

  constructor(
    @InjectQueue(RESET_BALANCE_QUEUE)
    private readonly resetBalanceQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.resetBalanceQueue.upsertJobScheduler(
      RESET_BALANCE_SCHEDULER,
      { pattern: '0 */10 * * * *' },
      {
        name: RESET_BALANCE_JOB,
        data: {},
        opts: this.jobOptions,
      },
    );

    this.logger.log('Balance reset BullMQ scheduler registered');
  }

  async resetBalance(): Promise<void> {
    const job = await this.resetBalanceQueue.add(
      RESET_BALANCE_JOB,
      {},
      this.jobOptions,
    );

    this.logger.log(`Balance reset job queued: jobId=${job.id}`);
  }

  private get jobOptions() {
    return {
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 1_000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    };
  }
}
