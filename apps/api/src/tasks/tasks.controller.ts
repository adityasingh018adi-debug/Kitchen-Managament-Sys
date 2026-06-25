import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role, TaskStatus } from '@kitchenos/db';
import { TasksService } from './tasks.service';
import { CreateTaskDto, FinishTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: TaskStatus,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.tasksService.findAll({ departmentId, status, employeeId });
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create(dto, user.userId);
  }

  @Patch(':id/start')
  start(@Param('id') id: string) {
    return this.tasksService.start(id);
  }

  @Patch(':id/finish')
  finish(@Param('id') id: string, @Body() dto: FinishTaskDto) {
    return this.tasksService.finish(id, dto);
  }
}
