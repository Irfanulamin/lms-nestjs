import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}
  async create(createCourseDto: CreateCourseDto) {
    return await this.courseModel.create(createCourseDto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    minPrice: number = 0,
    maxPrice: number = Infinity,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    // Ensure page and limit are within reasonable bounds
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    // Build the query object based on search and price filters
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.courseModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.courseModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return await this.courseModel.findById(id).exec();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    return await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.courseModel.findByIdAndDelete(id).exec();
  }
}
