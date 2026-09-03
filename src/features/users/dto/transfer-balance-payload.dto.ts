import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class TransferBalanceDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  senderId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  recipientId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
