# Giai đoạn 1: Cài đặt dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Sao chép các file định nghĩa thư viện
COPY package.json package-lock.json* ./

# Cài đặt thư viện dựa trên package-lock.json
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found. Đang chạy npm install thay thế..." && npm install; \
  fi

# Giai đoạn 2: Build source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js thu thập dữ liệu ẩn danh (tùy chọn tắt đi)
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Giai đoạn 3: Runner (Image cuối cùng siêu nhẹ)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Tạo user để không chạy bằng quyền root (bảo mật)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Chỉ lấy những file cần thiết sau khi build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]