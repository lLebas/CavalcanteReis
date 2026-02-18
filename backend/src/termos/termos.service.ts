import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermoDto } from './dto/create-termo.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';

@Injectable()
export class TermosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTermoDto: CreateTermoDto) {
    const now = new Date();

    let expiresAt: Date;
    if (createTermoDto.expiresAt) {
      expiresAt = new Date(createTermoDto.expiresAt);
    } else {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    return this.prisma.termoReferencia.create({
      data: {
        municipio: createTermoDto.municipio,
        formData: (createTermoDto.formData || {}) as any,
        expiresAt,
      },
    });
  }

  async findAll() {
    const now = new Date();

    await this.prisma.termoReferencia.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    return this.prisma.termoReferencia.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const termo = await this.prisma.termoReferencia.findUnique({
      where: { id },
    });

    if (!termo) {
      throw new NotFoundException(`Termo com ID ${id} não encontrado`);
    }

    return termo;
  }

  async update(id: string, updateTermoDto: UpdateTermoDto) {
    await this.findOne(id);

    return this.prisma.termoReferencia.update({
      where: { id },
      data: {
        ...(updateTermoDto as any),
        expiresAt: updateTermoDto.expiresAt
          ? new Date(updateTermoDto.expiresAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.termoReferencia.delete({ where: { id } });
  }
}
