import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudoDto } from './dto/create-estudo.dto';
import { UpdateEstudoDto } from './dto/update-estudo.dto';

@Injectable()
export class EstudosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEstudoDto: CreateEstudoDto) {
    const now = new Date();

    let expiresAt: Date;
    if (createEstudoDto.expiresAt) {
      expiresAt = new Date(createEstudoDto.expiresAt);
    } else {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    return this.prisma.estudoContratacao.create({
      data: {
        municipio: createEstudoDto.municipio,
        formData: (createEstudoDto.formData || {}) as any,
        expiresAt,
      },
    });
  }

  async findAll() {
    const now = new Date();

    await this.prisma.estudoContratacao.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    return this.prisma.estudoContratacao.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const estudo = await this.prisma.estudoContratacao.findUnique({
      where: { id },
    });

    if (!estudo) {
      throw new NotFoundException(`Estudo com ID ${id} não encontrado`);
    }

    return estudo;
  }

  async update(id: string, updateEstudoDto: UpdateEstudoDto) {
    await this.findOne(id);

    return this.prisma.estudoContratacao.update({
      where: { id },
      data: {
        ...(updateEstudoDto as any),
        expiresAt: updateEstudoDto.expiresAt
          ? new Date(updateEstudoDto.expiresAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.estudoContratacao.delete({ where: { id } });
  }
}
