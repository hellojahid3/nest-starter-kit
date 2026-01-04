import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export class SendEmailAttachmentDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsOptional()
  @IsString()
  cid?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsString()
  href?: string;
}

export class SendEmailDto {
  @IsArray()
  @IsEmail(
    {},
    {
      each: true,
      message: "All recipients must be valid email addresses",
    }
  )
  @IsNotEmpty({ message: "At least one recipient is required" })
  recipients: string[];

  @IsString({ message: "Subject must be a string" })
  @IsNotEmpty({ message: "Subject is required" })
  subject: string;

  @IsOptional()
  @IsString({ message: "HTML content must be a string" })
  html?: string;

  @IsOptional()
  @IsString({ message: "Text content must be a string" })
  text?: string;

  @IsOptional()
  @IsArray({ message: "cc must be an array" })
  @IsEmail(
    {},
    {
      each: true,
      message: "All cc recipients must be valid email addresses",
    }
  )
  @IsNotEmpty({ message: "At least one cc recipient is required" })
  cc?: string[];

  @IsOptional()
  @IsArray({ message: "Bcc must be an array" })
  @IsEmail(
    {},
    {
      each: true,
      message: "All Bcc recipients must be valid email addresses",
    }
  )
  @IsNotEmpty({ message: "At least one Bcc recipient is required" })
  bcc?: string[];

  @IsOptional()
  @IsString({ message: "Template must be a string" })
  template?: string;

  @IsOptional()
  @IsObject({ message: "Template data must be an object" })
  @ValidateIf((o: SendEmailDto) => o.template !== undefined)
  templateData?: Record<string, unknown>;

  @IsOptional()
  @IsArray({ message: "Attachments must be an array" })
  @ValidateNested({ each: true })
  @Type(() => SendEmailAttachmentDto)
  attachments?: SendEmailAttachmentDto[];
}
