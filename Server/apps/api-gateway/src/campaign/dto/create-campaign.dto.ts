import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CampaignRecipientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsISO8601({ strict: true })
  scheduledAt!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CampaignRecipientDto)
  recipients!: CampaignRecipientDto[];
}
