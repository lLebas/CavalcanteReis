import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto } from './dto/update-proposta.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PropostasService {
  private readonly dataFile = path.join(process.cwd(), 'data', 'proposals.json');

  private async readData(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeData(data: any[]): Promise<void> {
    const dir = path.dirname(this.dataFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Verifica se a proposta expirou (padrão: 1 ano = 365 dias)
  private isExpired(proposta: any): boolean {
    const now = new Date();
    const expiresAt = proposta.expiresAt ? new Date(proposta.expiresAt) : null;
    
    if (expiresAt) {
      return now > expiresAt;
    }
    
    // Se não tiver expiresAt, usa regra padrão de 365 dias
    const createdAt = new Date(proposta.createdAt);
    const diff = now.getTime() - createdAt.getTime();
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    return diff > oneYearInMs;
  }

  async create(createPropostaDto: CreatePropostaDto) {
    const items = await this.readData();
    const now = new Date();
    
    // Define expiresAt: usa o fornecido ou cria um padrão de 1 ano
    let expiresAt = createPropostaDto.expiresAt;
    if (!expiresAt) {
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      expiresAt = oneYearLater.toISOString();
    }
    
    const newProposta = {
      id: Date.now().toString(),
      ...createPropostaDto,
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    items.push(newProposta);
    await this.writeData(items);
    return newProposta;
  }

  async findAll() {
    const items = await this.readData();
    // Cleanup: remove propostas expiradas
    const filtered = items.filter((i) => !this.isExpired(i));
    if (filtered.length !== items.length) {
      await this.writeData(filtered);
    }
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findOne(id: string) {
    const items = await this.readData();
    const proposta = items.find((i) => i.id === id);
    if (!proposta) {
      throw new NotFoundException(`Proposta with ID ${id} not found`);
    }
    return proposta;
  }

  async update(id: string, updatePropostaDto: UpdatePropostaDto) {
    const items = await this.readData();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Proposta with ID ${id} not found`);
    }
    items[index] = {
      ...items[index],
      ...updatePropostaDto,
      updatedAt: new Date().toISOString(),
    };
    await this.writeData(items);
    return items[index];
  }

  async remove(id: string) {
    const items = await this.readData();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Proposta with ID ${id} not found`);
    }
    items.splice(index, 1);
    await this.writeData(items);
  }
}

