import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferBalanceDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
