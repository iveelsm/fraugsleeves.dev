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
ENV SITE_URL=${SITE_URL}

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/deployment/conf.d/ /etc/nginx/conf.d/
COPY --from=build /app/deployment/includes /etc/nginx/includes/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
