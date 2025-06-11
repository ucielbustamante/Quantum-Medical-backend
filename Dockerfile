FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

FROM node:18-alpine AS final

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
RUN npm install --omit=dev

COPY --from=builder /app /app
COPY --from=builder /app/node_modules ./node_modules

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 5000

RUN mkdir -p /app/uploads/temp

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]
