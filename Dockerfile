FROM node:20-alpine AS base
WORKDIR /app

ARG APP_NAME=mobile
ARG PORT=3001
ENV APP_NAME=${APP_NAME}
ENV PORT=${PORT}
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json turbo.json ./
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY apps/landing-page/package.json apps/landing-page/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/clinic-dashboard/package.json apps/clinic-dashboard/package.json
COPY apps/video/package.json apps/video/package.json

RUN npm ci --ignore-scripts

COPY packages/typescript-config packages/typescript-config
COPY apps/${APP_NAME} apps/${APP_NAME}
COPY data data

RUN mkdir -p /app/data && npm run build --workspace=@sakhi/${APP_NAME}

EXPOSE ${PORT}
CMD ["sh", "-c", "npm run start --workspace=@sakhi/${APP_NAME} -- -H 0.0.0.0 -p ${PORT}"]
