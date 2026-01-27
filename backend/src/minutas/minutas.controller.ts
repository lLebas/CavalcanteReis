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
import { MinutasService } from './minutas.service';
import { CreateMinutaDto } from './dto/create-minuta.dto';
import { UpdateMinutaDto } from './dto/update-minuta.dto';

@ApiTags('minutas')
@Controller('minutas')
export class MinutasController {
  constructor(private readonly minutasService: MinutasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova minuta' })
  @ApiResponse({ status: 201, description: 'Minuta criada com sucesso' })
  create(@Body() createMinutaDto: CreateMinutaDto) {
    return this.minutasService.create(createMinutaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as minutas' })
  @ApiResponse({ status: 200, description: 'Lista de minutas' })
  findAll() {
    return this.minutasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar minuta por ID' })
  @ApiResponse({ status: 200, description: 'Minuta encontrada' })
  @ApiResponse({ status: 404, description: 'Minuta não encontrada' })
  findOne(@Param('id') id: string) {
    return this.minutasService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar minuta' })
  @ApiResponse({ status: 200, description: 'Minuta atualizada' })
  update(@Param('id') id: string, @Body() updateMinutaDto: UpdateMinutaDto) {
    return this.minutasService.update(id, updateMinutaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar minuta' })
  @ApiResponse({ status: 204, description: 'Minuta deletada' })
  remove(@Param('id') id: string) {
    return this.minutasService.remove(id);
  }
}
