FROM node:12-slim

RUN apt update && apt install -y curl iputils-ping
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN  echo 15000 64000 > /proc/sys/net/ipv4/ip_local_port_range
COPY . .
EXPOSE 1883
CMD [ "npm", "start" ]
