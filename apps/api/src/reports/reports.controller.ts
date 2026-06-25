import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@kitchenos/db';
import { ReportsService } from './reports.service';

function parseRange(from?: string, to?: string) {
  return {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tasks.csv')
  async tasksCsv(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const csv = await this.reportsService.tasksCsv(parseRange(from, to));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.csv"');
    res.send(csv);
  }

  @Get('attendance.csv')
  async attendanceCsv(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const csv = await this.reportsService.attendanceCsv(parseRange(from, to));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
    res.send(csv);
  }

  @Get('inventory.csv')
  async inventoryCsv(@Res() res: Response) {
    const csv = await this.reportsService.inventoryCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
    res.send(csv);
  }

  @Get('tasks.pdf')
  async tasksPdf(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const pdf = await this.reportsService.tasksPdf(parseRange(from, to));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.pdf"');
    res.send(pdf);
  }
}
