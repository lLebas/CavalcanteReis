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
import { TermosService } from './termos.service';
import { CreateTermoDto } from './dto/create-termo.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';

@ApiTags('termos')
@Controller('termos')
export class TermosController {
  constructor(private readonly termosService: TermosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo termo de referência' })
  @ApiResponse({ status: 201, description: 'Termo criado com sucesso' })
  create(@Body() createTermoDto: CreateTermoDto) {
    return this.termosService.create(createTermoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os termos' })
  @ApiResponse({ status: 200, description: 'Lista de termos' })
  findAll() {
    return this.termosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar termo por ID' })
  @ApiResponse({ status: 200, description: 'Termo encontrado' })
  @ApiResponse({ status: 404, description: 'Termo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.termosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar termo' })
  @ApiResponse({ status: 200, description: 'Termo atualizado' })
  update(@Param('id') id: string, @Body() updateTermoDto: UpdateTermoDto) {
    return this.termosService.update(id, updateTermoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar termo' })
  @ApiResponse({ status: 204, description: 'Termo deletado' })
  remove(@Param('id') id: string) {
    return this.termosService.remove(id);
  }
}
