import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No users found — run main seed first");

  const rec = await prisma.recommendation.upsert({
    where: { id: "rec-ninth-street" },
    update: {},
    create: {
      id: "rec-ninth-street",
      authorId: user.id,
      businessName: "Ninth Street Soccer & Coffee",
      category: "other",
      description:
        "A beloved Twin Cities gathering spot where the soccer community meets great coffee. Indoor soccer training, youth leagues, and a welcoming café all under one roof.",
      whyRecommend:
        "Incredible community hub for families and athletes alike. Christian-owned and community-focused.",
      neighborhood: "Minneapolis",
      featuredPartner: true,
    },
  });

  const church = await prisma.church.upsert({
    where: { id: "church-vine-mpls" },
    update: {},
    create: {
      id: "church-vine-mpls",
      name: "Vine Church Minneapolis",
      denomination: "non-denominational",
      address: "Minneapolis, MN",
      neighborhood: "Minneapolis",
      description:
        "A vibrant, gospel-centered church in Minneapolis committed to making disciples and serving the city.",
      serviceStyle: "contemporary",
      featuredPartner: true,
    },
  });

  console.log("✅ Added:", rec.businessName, "|", church.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
