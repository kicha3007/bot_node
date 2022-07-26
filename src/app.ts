import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


class App {
  public   async init() {
    await prisma.$connect();
    await prisma.user.findFirst({where: {id: '1'}});
  }
}

const app = new App();
app.init();