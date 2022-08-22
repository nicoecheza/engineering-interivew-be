FROM node:18-alpine

RUN apk add --no-cache python3 make g++

COPY ./package*.json /api/

WORKDIR /api
RUN npm install --ignore-scripts
RUN npm rebuild

COPY . /api/

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/."]
