FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .
RUN npx prisma generate

ENTRYPOINT ["npm", "run", "dev"]
