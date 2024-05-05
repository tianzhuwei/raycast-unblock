FROM --platform=$BUILDPLATFORM node:21-alpine AS builder

RUN apk add make g++ alpine-sdk python3 py3-pip
RUN npm i -g pnpm@8.15.1

WORKDIR /app

COPY . .
# Exclude packages/raycast -- just delete it...
RUN rm -rf packages/raycast
RUN pnpm install
RUN pnpm build:core
RUN pnpm bundle

FROM --platform=$BUILDPLATFORM alpine:3.19 AS runner

RUN apk add --no-cache libstdc++

WORKDIR /app

COPY --from=builder /app/dist/raycast-unblock-app .

ENV TZ=Asia/Shanghai

EXPOSE 3000

ENTRYPOINT ["./raycast-unblock-app"]