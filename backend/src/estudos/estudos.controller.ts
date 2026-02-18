import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EstudosService } from './estudos.service';
import { CreateEstudoDto } from './dto/create-estudo.dto';
import { UpdateEstudoDto } from './dto/update-estudo.dto';

@ApiTags('estudos')
@Controller('estudos')
export class EstudosController {
  constructor(private readonly estudosService: EstudosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo estudo de contratação' })
  @ApiResponse({ status: 201, description: 'Estudo criado com sucesso' })
  create(@Body() createEstudoDto: CreateEstudoDto) {
    return this.estudosService.create(createEstudoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estudos' })
  @ApiResponse({ status: 200, description: 'Lista de estudos' })
  findAll() {
    return this.estudosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estudo por ID' })
  @ApiResponse({ status: 200, description: 'Estudo encontrado' })
  @ApiResponse({ status: 404, description: 'Estudo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.estudosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar estudo' })
  @ApiResponse({ status: 200, description: 'Estudo atualizado' })
  update(@Param('id') id: string, @Body() updateEstudoDto: UpdateEstudoDto) {
    return this.estudosService.update(id, updateEstudoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar estudo' })
  @ApiResponse({ status: 204, description: 'Estudo deletado' })
  remove(@Param('id') id: string) {
    return this.estudosService.remove(id);
  }
}
