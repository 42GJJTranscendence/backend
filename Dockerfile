# 1. NestJS 프로젝트를 빌드할 기반 이미지 설정
FROM node:20 as build

# 작업 디렉토리 생성 및 설정
WORKDIR /app

# NestJS 프로젝트의 package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드를 Docker 이미지로 복사
COPY . .

# NestJS 프로젝트 빌드
RUN npm run build

# 2. 실행을 위한 Node.js 이미지 설정
FROM node:20

# 작업 디렉토리 생성 및 설정
WORKDIR /app

# 빌드된 파일들을 기반 이미지로 복사
COPY --from=build /app/dist ./dist
COPY package*.json ./

# 의존성 설치 (개발 의존성은 필요하지 않으므로 --only=production 사용)
RUN npm install --only=production

# NestJS 애플리케이션 실행
CMD ["node", "dist/main"]