import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.ick.createMany({
    data: [
      {
        content: "When someone chews loudly in a quiet room",
        tags: ["manners", "noise"],
        severity: 3,
        sentiment: "negative",
      },
      {
        content: "Getting ghosted after a great conversation",
        tags: ["dating", "communication"],
        severity: 5,
        sentiment: "negative",
      },
      {
        content: "Friend remembering your coffee order",
        tags: ["friendship", "kindness"],
        severity: 1,
        sentiment: "positive",
      },
    ],
  });

  console.log("✅ Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
