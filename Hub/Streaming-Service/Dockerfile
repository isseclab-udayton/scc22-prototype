FROM ubuntu:20.04
# FROM nginx:1.19.10
# RUN apt update && DEBIAN_FRONTEND="noninteractive" TZ="America/New_York" apt install -y git build-essential \
#     ffmpeg libpcre3 libpcre3-dev libssl-dev zlib1g-dev wget && \
#     rm -rf /var/lib/apt/lists/*

# RUN mkdir -p /tmp/src && cd /tmp/src && git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git \
#     && wget http://nginx.org/download/nginx-1.17.6.tar.gz \
#     && tar -zxvf nginx-1.17.6.tar.gz && cd nginx-1.17.6 && ./configure --prefix=/usr/local/nginx --with-http_ssl_module --add-module=../nginx-rtmp-module && make -j 1 && make install

# RUN cd /tmp/src && tar -zxvf nginx-1.17.6.tar.gz && cd nginx-1.17.6 && ./configure --prefix=/usr/local/nginx --with-http_ssl_module --add-module=../nginx-rtmp-module && make -j 1 && make install

#RUN apt update && apt install -y nginx  libnginx-mod-rtmp && rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y nginx-full  libnginx-mod-rtmp && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]