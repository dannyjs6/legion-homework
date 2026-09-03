import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  RESET_BALANCE_JOB,
  RESET_BALANCE_QUEUE,
} from './reset-balance.constants';
import { Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Processor(RESET_BALANCE_QUEUE, { concurrency: 1 })
export class ResetBalanceProcessor extends WorkerHost {
  private readonly logger = new Logger(ResetBalanceProcessor.name);

  constructor(private readonly usersService: UsersService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== RESET_BALANCE_JOB) {
      this.logger.warn(
        `Unknown balance job skipped: jobId=${job.id}, name=${job.name}`,
      );
      return;
    }

    this.logger.debug(`Balance reset job started: jobId=${job.id}`);

    try {
      await this.usersService.resetAllBalances();
      this.logger.log(`Balance reset job completed: jobId=${job.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Balance reset job failed: jobId=${job.id}, reason=${message}`,
        stack,
      );
      throw error;
    }
  }
}
