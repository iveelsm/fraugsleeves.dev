FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./

RUN --mount=type=secret,id=NPM_TOKEN \
    echo "@iveelsm:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/NPM_TOKEN)" >> .npmrc && \
    npm ci && \
    rm -f .npmrc

COPY . .

ARG SITE_URL=https://fraugsleeves.dev
ARG BUILD_HASH
ENV SITE_URL=${SITE_URL}
ENV BUILD_HASH=${BUILD_HASH}

RUN npm run build

FROM alpine:latest AS templates

ARG BUILD_HASH

COPY deployment/conf.d/ /templates/conf.d/
RUN envsubst '${BUILD_HASH}' < /templates/conf.d/default.conf.template > /templates/conf.d/default.conf

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=templates /templates/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY deployment/includes /etc/nginx/includes/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
