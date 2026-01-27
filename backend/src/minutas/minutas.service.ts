import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMinutaDto } from './dto/create-minuta.dto';
import { UpdateMinutaDto } from './dto/update-minuta.dto';

@Injectable()
export class MinutasService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria uma nova minuta no banco de dados
  async create(createMinutaDto: CreateMinutaDto) {
    const now = new Date();

    // Define expiresAt: usa o fornecido ou cria um padrão de 1 ano
    let expiresAt: Date;
    if (createMinutaDto.expiresAt) {
      expiresAt = new Date(createMinutaDto.expiresAt);
    } else {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    return this.prisma.minuta.create({
      data: {
        municipio: createMinutaDto.municipio,
        objeto: createMinutaDto.objeto,
        valorContrato: createMinutaDto.valorContrato,
        prazoVigencia: createMinutaDto.prazoVigencia,
        dataAssinatura: createMinutaDto.dataAssinatura,
        representante: createMinutaDto.representante,
        cargo: createMinutaDto.cargo,
        services: createMinutaDto.services || {},
        customCabimentos: createMinutaDto.customCabimentos || {},
        expiresAt,
      },
    });
  }

  // Lista todas as minutas não expiradas
  async findAll() {
    const now = new Date();

    // Remove minutas expiradas automaticamente
    await this.prisma.minuta.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Retorna minutas válidas ordenadas por data de criação (mais recentes primeiro)
    return this.prisma.minuta.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Busca uma minuta específica por ID
  async findOne(id: string) {
    const minuta = await this.prisma.minuta.findUnique({
      where: { id },
    });

    if (!minuta) {
      throw new NotFoundException(`Minuta com ID ${id} não encontrada`);
    }

    return minuta;
  }

  // Atualiza uma minuta existente
  async update(id: string, updateMinutaDto: UpdateMinutaDto) {
    // Verifica se a minuta existe
    await this.findOne(id);

    return this.prisma.minuta.update({
      where: { id },
      data: {
        ...updateMinutaDto,
        // Se expiresAt foi passado como string, converte para Date
        expiresAt: updateMinutaDto.expiresAt
          ? new Date(updateMinutaDto.expiresAt)
          : undefined,
      },
    });
  }

  // Remove uma minuta
  async remove(id: string) {
    // Verifica se a minuta existe
    await this.findOne(id);

    await this.prisma.minuta.delete({
      where: { id },
    });
  }
}
