import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000'];

  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origem apenas em desenvolvimento (mobile apps, Postman, etc)
      if (!origin) {
        if (isDevelopment) {
          callback(null, true);
        } else {
          callback(new Error('CORS: Origin header required in production'));
        }
        return;
      }

      // Sempre verifica a whitelist primeiro
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Em desenvolvimento, permite localhost para facilitar testes locais
      if (isDevelopment && origin.startsWith('http://localhost:')) {
        callback(null, true);
        return;
      }

      // Rejeita todas as outras origens
      callback(new Error(`CORS: Origin '${origin}' not allowed by CORS policy`));
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Cavalcante Reis API')
    .setDescription('API para sistema de propostas advocatícias')
    .setVersion('1.0')
    .addTag('propostas')
    .addTag('documents')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();

