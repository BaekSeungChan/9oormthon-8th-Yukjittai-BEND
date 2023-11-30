FROM krmp-d2hub-idock.9rum.cc/goorm/node:18

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV production

CMD [ "npm", "run", "start" ]