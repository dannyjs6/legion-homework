import { IsNumber, IsPositive } from 'class-validator';

export class AddBalanceToAllDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
