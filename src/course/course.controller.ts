import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Role, Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    if (course) {
      return {
        statusCode: 201,
        message: 'Course created successfully',
        data: course,
      };
    }
  }

  @Get('/all')
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const courses = await this.courseService.findAll(page, limit);
    return {
      statusCode: 200,
      message: 'Courses retrieved successfully',
      data: courses,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    return {
      statusCode: 200,
      message: 'Course retrieved successfully',
      data: course,
    };
  }

  @Patch('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.courseService.update(id, updateCourseDto);
    return {
      statusCode: 200,
      message: 'Course updated successfully',
      data: course,
    };
  }

  @Delete('/delete/:id')
  async remove(@Param('id') id: string) {
    const result = await this.courseService.remove(id);
    return {
      statusCode: 200,
      message: 'Course deleted successfully',
      data: result,
    };
  }
}
