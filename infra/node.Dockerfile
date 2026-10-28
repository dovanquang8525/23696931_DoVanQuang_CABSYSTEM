FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
COPY gateway/package.json gateway/package.json
COPY services/auth_service/package.json services/auth_service/package.json
COPY services/customer_service/package.json services/customer_service/package.json
COPY services/driver_service/package.json services/driver_service/package.json
COPY services/booking_service/package.json services/booking_service/package.json
COPY services/trip_service/package.json services/trip_service/package.json
COPY services/payment_service/package.json services/payment_service/package.json
COPY services/notification_service/package.json services/notification_service/package.json
COPY services/rating_service/package.json services/rating_service/package.json
RUN npm ci --omit=dev
COPY scripts ./scripts
COPY proto ./proto
COPY docs/api ./docs/api
COPY docs/events ./docs/events
COPY gateway ./gateway
COPY services ./services
USER node
CMD ["node", "gateway/index.cjs"]
