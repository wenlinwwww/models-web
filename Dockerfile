# build front-end
FROM node:18-alpine AS frontend

RUN npm install pnpm -g && \
npm config set registry https://registry.npmmirror.com && \
pnpm config set registry https://registry.npmmirror.com


WORKDIR /app

COPY ./package.json /app

COPY ./pnpm-lock.yaml /app

RUN pnpm install

COPY . /app

RUN pnpm run build

# build backend
FROM node:18-alpine as backend

RUN npm install pnpm -g && \
npm config set registry https://registry.npmmirror.com && \
pnpm config set registry https://registry.npmmirror.com


WORKDIR /app

COPY /service/package.json /app

COPY /service/pnpm-lock.yaml /app

RUN pnpm install

COPY /service /app

RUN pnpm build

# service
FROM node:18-alpine

RUN npm install pnpm -g && \
npm config set registry https://registry.npmmirror.com && \
pnpm config set registry https://registry.npmmirror.com

WORKDIR /app

COPY /service/package.json /app

COPY /service/pnpm-lock.yaml /app

RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*

COPY /service /app

COPY --from=frontend /app/dist /app/public

COPY --from=backend /app/build /app/build

EXPOSE 3002

CMD ["pnpm", "run", "prod"]
