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
import { PareceresService } from './pareceres.service';
import { CreateParecerDto } from './dto/create-parecer.dto';
import { UpdateParecerDto } from './dto/update-parecer.dto';

@ApiTags('pareceres')
@Controller('pareceres')
export class PareceresController {
  constructor(private readonly pareceresService: PareceresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo parecer jurídico' })
  @ApiResponse({ status: 201, description: 'Parecer criado com sucesso' })
  create(@Body() createParecerDto: CreateParecerDto) {
    return this.pareceresService.create(createParecerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pareceres' })
  @ApiResponse({ status: 200, description: 'Lista de pareceres' })
  findAll() {
    return this.pareceresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar parecer por ID' })
  @ApiResponse({ status: 200, description: 'Parecer encontrado' })
  @ApiResponse({ status: 404, description: 'Parecer não encontrado' })
  findOne(@Param('id') id: string) {
    return this.pareceresService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar parecer' })
  @ApiResponse({ status: 200, description: 'Parecer atualizado' })
  update(
    @Param('id') id: string,
    @Body() updateParecerDto: UpdateParecerDto,
  ) {
    return this.pareceresService.update(id, updateParecerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar parecer' })
  @ApiResponse({ status: 204, description: 'Parecer deletado' })
  remove(@Param('id') id: string) {
    return this.pareceresService.remove(id);
  }
}
