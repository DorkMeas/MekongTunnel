FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "start"]
