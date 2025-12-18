import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { Response } from 'express';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('process-docx')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Processar arquivo DOCX existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        municipio: {
          type: 'string',
        },
        data: {
          type: 'string',
        },
      },
    },
  })
  async processDocx(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body('municipio') municipio?: string,
    @Body('data') data?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const buffer = await this.documentsService.processDocx(
      file.buffer,
      municipio,
      data,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Proposta-ajustada.docx',
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Post('generate-docx')
  @ApiOperation({ summary: 'Gerar novo arquivo DOCX a partir de dados' })
  async generateDocx(@Body() data: any, @Res() res: Response) {
    const buffer = await this.documentsService.generateFromData(data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Proposta_${data.municipio || 'Docs'}.docx`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}
