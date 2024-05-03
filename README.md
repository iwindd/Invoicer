# Invoicer
## Requirement
+ NodeJS v16.20.0
+ Database MariaDB v10.4.8
+ WebServer Apache v.2.X.X

## Framework
+ NextJS v.13.5.6
+ UI Material
+ Icon Material Icons
+ Date Dayjs

## Installation
+ npm install
+ change .env.example to .env 
+ npx prisma migrate dev --name invoicer
+ npx prisma db seed
+ npm run prisma

## Development
+ npm run dev

## Production
+ npm run build
+ npm run start