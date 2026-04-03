FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /app

COPY package.json ./
COPY workers/playwright/package.json workers/playwright/package.json

RUN npm install

COPY . .

WORKDIR /app/workers/playwright

CMD ["npm", "run", "start"]
