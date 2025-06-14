import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresError } from './interfaces/postgres-error.interface';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly _todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    try {
      const todo = this._todoRepository.create(createTodoDto);
      await this._todoRepository.save(todo);
      return todo;
    } catch (error) {
      this.handleDBExceptions(error as PostgresError);
    }
  }

  findAll() {
    return this._todoRepository.find();
  }

  async findOne(id: string) {
    const todo = await this._todoRepository.findOneBy({ id: id });
    if (!todo) throw new NotFoundException(`Todo with ID "${id}" not found`);
    return todo;
  }

  // async remove(id: string) {
  //   const todo = await this.findOne(id);
  //   await this._todoRepository.remove(todo);
  // }

  async remove(id: string) {
    try {
      const result = await this._todoRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Todo with ID "${id}" not found`);
      }

      return { message: `Todo with ID "${id}" deleted successfully` };
    } catch (error) {
      this.handleDBExceptions(error as PostgresError);
    }
  }

  private handleDBExceptions(error: PostgresError) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    if (error.code === '23502') {
      // Not-null constraint violation
      throw new BadRequestException('Missing required value.');
    }

    if (error.code === '22P02') {
      // Invalid UUID format
      throw new BadRequestException('Invalid identifier format.');
    }

    // Default for unexpected errors
    console.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs.',
    );
  }

  // update(id: number, updateTodoDto: UpdateTodoDto) {
  //   return `This action updates a #${id} todo`;
  // }
}
