FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG SITE_URL=https://fraugsleeves.dev
ENV SITE_URL=${SITE_URL}

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
