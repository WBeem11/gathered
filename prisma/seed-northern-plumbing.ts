import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("No user found");

  const rec = await prisma.recommendation.upsert({
    where: { id: "rec-northern-plumbing" },
    update: {},
    create: {
      id: "rec-northern-plumbing",
      authorId: user.id,
      businessName: "Northern Plumbing & Softening",
      category: "plumber",
      description: "Twin Cities plumbing and water softening experts serving Minneapolis and surrounding areas.",
      whyRecommend: "Trusted local plumbers with deep roots in the Twin Cities community.",
      neighborhood: "Minneapolis",
      website: "https://www.northernplumbingandsoftening.com/",
      featuredPartner: true,
    },
  });

  console.log("Added:", rec.businessName, "| Featured:", rec.featuredPartner);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
