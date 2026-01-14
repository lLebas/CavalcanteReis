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

  private isOlderThan365Days(iso: string): boolean {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff > 365 * 24 * 60 * 60 * 1000; // 365 dias
  }

  async create(createPropostaDto: CreatePropostaDto) {
    const items = await this.readData();
    const newProposta = {
      id: Date.now().toString(),
      ...createPropostaDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newProposta);
    await this.writeData(items);
    return newProposta;
  }

  async findAll() {
    const items = await this.readData();
    // Cleanup: remove items older than 365 days
    const filtered = items.filter((i) => !this.isOlderThan365Days(i.createdAt));
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

