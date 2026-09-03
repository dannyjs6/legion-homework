## Для запуска проекта:

```
cp .env.example .env

docker compose up -d

npm i

npm run migration:up

npm run seed

npm run start:dev
```

## Что бы получить ключи minio:

```
Устанавливаем локально пакет brew install minio-mc

mc alias set local http://localhost:9000 minioadmin minioadmin
mc admin accesskey create local

accessKeyId - это Access Key
secretAccessKey - это Secret Key

```
