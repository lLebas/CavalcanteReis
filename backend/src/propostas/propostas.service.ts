import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto } from './dto/update-proposta.dto';

@Injectable()
export class PropostasService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria uma nova proposta no banco de dados
  async create(createPropostaDto: CreatePropostaDto) {
    const now = new Date();

    // Define expiresAt: usa o fornecido ou cria um padrão de 1 ano
    let expiresAt: Date;
    if (createPropostaDto.expiresAt) {
      expiresAt = new Date(createPropostaDto.expiresAt);
    } else {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    return this.prisma.proposta.create({
      data: {
        municipio: createPropostaDto.municipio,
        destinatario: createPropostaDto.destinatario,
        data: createPropostaDto.data,
        prazo: createPropostaDto.prazo,
        services: createPropostaDto.services || {},
        customCabimentos: createPropostaDto.customCabimentos || {},
        customEstimates: createPropostaDto.customEstimates || {},
        footerOffices: createPropostaDto.footerOffices || {},
        paymentValue: createPropostaDto.paymentValue,
        expiresAt,
      },
    });
  }

  // Lista todas as propostas não expiradas
  async findAll() {
    const now = new Date();

    // Remove propostas expiradas automaticamente
    await this.prisma.proposta.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Retorna propostas válidas ordenadas por data de criação (mais recentes primeiro)
    return this.prisma.proposta.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Busca uma proposta específica por ID
  async findOne(id: string) {
    const proposta = await this.prisma.proposta.findUnique({
      where: { id },
    });

    if (!proposta) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    return proposta;
  }

  // Atualiza uma proposta existente
  async update(id: string, updatePropostaDto: UpdatePropostaDto) {
    // Verifica se a proposta existe
    await this.findOne(id);

    return this.prisma.proposta.update({
      where: { id },
      data: {
        ...updatePropostaDto,
        // Se expiresAt foi passado como string, converte para Date
        expiresAt: updatePropostaDto.expiresAt
          ? new Date(updatePropostaDto.expiresAt)
          : undefined,
      },
    });
  }

  // Remove uma proposta
  async remove(id: string) {
    // Verifica se a proposta existe
    await this.findOne(id);

    await this.prisma.proposta.delete({
      where: { id },
    });
  }
}
