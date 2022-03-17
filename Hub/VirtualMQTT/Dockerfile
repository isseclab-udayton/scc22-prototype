FROM node:12-slim

RUN apt update && apt install -y curl iputils-ping
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 1883
CMD [ "npm", "start" ]
