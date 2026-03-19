import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rec = await prisma.recommendation.update({
    where: { id: "rec-ninth-street" },
    data: { website: "https://www.ninthstreetmpls.com/" },
    select: { businessName: true, website: true },
  });
  console.log("Updated:", rec.businessName, "→", rec.website);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
