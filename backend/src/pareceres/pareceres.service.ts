import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParecerDto } from './dto/create-parecer.dto';
import { UpdateParecerDto } from './dto/update-parecer.dto';

@Injectable()
export class PareceresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createParecerDto: CreateParecerDto) {
    const now = new Date();

    let expiresAt: Date;
    if (createParecerDto.expiresAt) {
      expiresAt = new Date(createParecerDto.expiresAt);
    } else {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    return this.prisma.parecerJuridico.create({
      data: {
        municipio: createParecerDto.municipio,
        formData: (createParecerDto.formData || {}) as any,
        expiresAt,
      },
    });
  }

  async findAll() {
    const now = new Date();

    await this.prisma.parecerJuridico.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    return this.prisma.parecerJuridico.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const parecer = await this.prisma.parecerJuridico.findUnique({
      where: { id },
    });

    if (!parecer) {
      throw new NotFoundException(`Parecer com ID ${id} não encontrado`);
    }

    return parecer;
  }

  async update(id: string, updateParecerDto: UpdateParecerDto) {
    await this.findOne(id);

    return this.prisma.parecerJuridico.update({
      where: { id },
      data: {
        ...(updateParecerDto as any),
        expiresAt: updateParecerDto.expiresAt
          ? new Date(updateParecerDto.expiresAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.parecerJuridico.delete({ where: { id } });
  }
}
