# docker build -f Dockerfile ./ -t artyomsliusar/storage-of-knowledge-fe:01
# docker run -ti --rm artyomsliusar/storage-of-knowledge-fe:01 bash
# docker run --rm --network="host" \
#	-v $(pwd)/.env:/usr/share/nginx/html/.env \
# 	artyomsliusar/storage-of-knowledge-fe:01

FROM node:alpine as builder
WORKDIR /app
COPY . .
RUN npm run build

# => Run container
FROM nginx:1.15.2-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY deploy/conf /etc/nginx

# Static build
COPY --from=builder /app/build /usr/share/nginx/html/

# Default port exposure
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY ./example.env ./.env

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]