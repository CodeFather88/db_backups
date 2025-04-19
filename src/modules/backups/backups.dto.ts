import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsInt, Min, Max } from "class-validator";

export class RestorePostgresDto {
    @ApiProperty({
        description: 'Host of the target PostgreSQL database',
        example: 'localhost',
    })
    @IsString()
    @IsNotEmpty()
    newDbHost: string;

    @ApiProperty({
        description: 'Port of the target PostgreSQL database',
        example: 5432,
    })
    @Type(() => String)
    @IsInt()
    @Min(1)
    @Max(65535)
    newDbPort: string;

    @ApiProperty({
        description: 'Password for the target PostgreSQL database',
        example: 'your_password',
        required: false,
    })
    @IsString()
    newDbPassword: string;

    @ApiProperty({
        description: 'Name of the target PostgreSQL database',
        example: 'db',
    })
    @IsString()
    @IsNotEmpty()
    newDbName: string;

    @ApiProperty({
        description: 'Username for the target PostgreSQL database',
        example: 'postgres',
    })
    @IsString()
    @IsNotEmpty()
    newDbUserName: string;
}