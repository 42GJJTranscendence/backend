import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomExceptionFilter } from './common/exception/exception.filter';

const port = process.env.PORT || 5000;

async function bootstrap() {

  console.log(port);
  const app = await NestFactory.create(AppModule);

  //Cors
  app.enableCors({
    origin: "*",
    credentials: true,
  });
  
  //Swagger
  const config = new DocumentBuilder()
      .setTitle('TS API DOCS')
      .setDescription('TS API 문서')
      .setVersion('0.0.1')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
        'access-token',
      )
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //exception
  app.useGlobalFilters(new CustomExceptionFilter());
  
  //run
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
