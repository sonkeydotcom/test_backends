import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('I-Tapp Backend')
    .setDescription('Api Documentation for I-tapp')
    .setVersion('1.0')
    .addTag('I-Tapp')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.enableVersioning();
  app.use(helmet());
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
  console.log(`I-Tapp is running on: ${await app.getUrl()}`);
}
bootstrap();
