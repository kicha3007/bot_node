# Бот магазина

## Установка
- Запускаем `npm ci`
- Копируем `.env.example` в `.env`
- Добавляем ваши `TOKEN` и `DATABASE_URL` в `.env`
- Запускаем `docker compose up -d`

## Команды

- `npm run dev` - запускаем в дев режиме
- `npm run build` - собираем из typescript-а
- `npm run start` - запускаем проект в production режиме
- `npm run lint` - запускаем линтер для проверки
- `npm run lint:fix` - запускаем линтер для исправления
- `npm run generate` - генерируем типы в prisma
_______________________________________________
- `tsc prisma/seed.ts && node prisma/seed.js` начальное заполнение базы данными


