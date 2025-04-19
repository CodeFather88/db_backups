import { Controller } from '@nestjs/common';
import { BackupsService } from './backups.service';

@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}
}
