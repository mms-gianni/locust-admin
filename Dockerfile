
FROM node:16-alpine as base
ENV NODE_ENV=production
WORKDIR /swarmadmin

RUN mkdir -p /swarmadmin/client /swarmadmin/app

COPY ["package.json", "package-lock.json", "./"]
COPY "app" "./app"
COPY "client" "./client"

RUN npm ci --production \
    && cd client \
    && npm ci --production=false\
    && npm run build

#RUN cd client && npm ci && npm build
CMD [ "node", "index.js" ]