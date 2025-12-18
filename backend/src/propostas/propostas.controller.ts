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
import { PropostasService } from './propostas.service';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto } from './dto/update-proposta.dto';

@ApiTags('propostas')
@Controller('propostas')
export class PropostasController {
  constructor(private readonly propostasService: PropostasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova proposta' })
  @ApiResponse({ status: 201, description: 'Proposta criada com sucesso' })
  create(@Body() createPropostaDto: CreatePropostaDto) {
    return this.propostasService.create(createPropostaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as propostas' })
  @ApiResponse({ status: 200, description: 'Lista de propostas' })
  findAll() {
    return this.propostasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar proposta por ID' })
  @ApiResponse({ status: 200, description: 'Proposta encontrada' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  findOne(@Param('id') id: string) {
    return this.propostasService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar proposta' })
  @ApiResponse({ status: 200, description: 'Proposta atualizada' })
  update(@Param('id') id: string, @Body() updatePropostaDto: UpdatePropostaDto) {
    return this.propostasService.update(id, updatePropostaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar proposta' })
  @ApiResponse({ status: 204, description: 'Proposta deletada' })
  remove(@Param('id') id: string) {
    return this.propostasService.remove(id);
  }
}

