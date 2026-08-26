## Для запуска проекта:

```
cp .env.example .env

docker compose up -d

npm i

npm run migration:up

npm run seed:users

npm run start:dev
```