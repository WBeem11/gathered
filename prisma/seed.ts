import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Churches ─────────────────────────────────────────────────────────────
  const churches = await Promise.all([
    prisma.church.upsert({
      where: { id: "church-bethel" },
      update: {},
      create: {
        id: "church-bethel",
        name: "Bethel Church",
        denomination: "non-denominational",
        address: "6820 Auto Club Rd, Bloomington, MN 55438",
        neighborhood: "Bloomington",
        serviceTimes: "Sat 5pm, Sun 9am & 11am",
        website: "www.bethel.edu/church",
        phone: "(651) 638-6400",
        description: "A vibrant, multi-generational church committed to following Jesus together and serving the world.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-eagle-brook" },
      update: {},
      create: {
        id: "church-eagle-brook",
        name: "Eagle Brook Church",
        denomination: "non-denominational",
        address: "Multiple campuses across the Twin Cities",
        neighborhood: "Twin Cities Metro",
        serviceTimes: "Sat 5pm, Sun 9am & 11am",
        website: "www.eaglebrookchurch.com",
        phone: "(651) 653-7400",
        description: "Eagle Brook is a growing family of churches in the Twin Cities passionate about helping people find and follow Jesus.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-grace" },
      update: {},
      create: {
        id: "church-grace",
        name: "Grace Church",
        denomination: "non-denominational",
        address: "6801 Beck Rd, Eden Prairie, MN 55344",
        neighborhood: "Eden Prairie",
        serviceTimes: "Sun 9am & 11am",
        website: "www.gracechurch.com",
        phone: "(952) 944-6300",
        description: "Grace Church is a community of believers dedicated to knowing God and making Him known throughout the Twin Cities.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-wooddale" },
      update: {},
      create: {
        id: "church-wooddale",
        name: "Wooddale Church",
        denomination: "evangelical",
        address: "6630 Shady Oak Rd, Eden Prairie, MN 55344",
        neighborhood: "Eden Prairie",
        serviceTimes: "Sun 9am, 10:30am & 12pm",
        website: "www.wooddale.org",
        phone: "(952) 952-7800",
        description: "Wooddale Church exists to honor God by making more disciples of Jesus Christ for the transformation of the world.",
        serviceStyle: "blended",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-north-heights" },
      update: {},
      create: {
        id: "church-north-heights",
        name: "North Heights Lutheran Church",
        denomination: "lutheran",
        address: "1700 Highway 96 W, Arden Hills, MN 55112",
        neighborhood: "Arden Hills",
        serviceTimes: "Sun 9am & 10:45am",
        website: "www.northheights.org",
        phone: "(651) 484-3900",
        description: "North Heights is a charismatic Lutheran church with a heart for worship, prayer, and the power of the Holy Spirit.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-oak-hills" },
      update: {},
      create: {
        id: "church-oak-hills",
        name: "Oak Hills Church",
        denomination: "non-denominational",
        address: "100 County Rd 42 W, Burnsville, MN 55306",
        neighborhood: "Burnsville",
        serviceTimes: "Sat 5pm, Sun 9am & 10:45am",
        website: "www.oakhillschurch.com",
        phone: "(952) 890-1500",
        description: "Oak Hills is a welcoming community of faith in the south metro dedicated to helping every person thrive in their walk with God.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-valley-church" },
      update: {},
      create: {
        id: "church-valley-church",
        name: "Valley Church",
        denomination: "evangelical",
        address: "4885 Hodgson Rd, Shoreview, MN 55126",
        neighborhood: "Shoreview",
        serviceTimes: "Sun 9am & 10:45am",
        website: "www.valleychurchmn.com",
        phone: "(651) 483-7100",
        description: "A warm, family-focused church in the north metro committed to biblical teaching and loving community.",
        serviceStyle: "blended",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-south-brook" },
      update: {},
      create: {
        id: "church-south-brook",
        name: "Southbrook Church",
        denomination: "non-denominational",
        address: "8600 Southbrook Pkwy, Minneapolis, MN 55438",
        neighborhood: "Minneapolis",
        serviceTimes: "Sun 9:30am & 11am",
        website: "www.southbrook.org",
        phone: "(612) 831-1500",
        description: "Southbrook is a diverse, Spirit-filled community in the heart of Minneapolis united by love for Jesus and neighbor.",
        serviceStyle: "contemporary",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-roseville-covenant" },
      update: {},
      create: {
        id: "church-roseville-covenant",
        name: "Roseville Covenant Church",
        denomination: "evangelical",
        address: "1910 Hamline Ave N, Roseville, MN 55113",
        neighborhood: "Roseville",
        serviceTimes: "Sun 9am & 10:45am",
        website: "www.rosevillecovenant.org",
        phone: "(651) 487-7667",
        description: "A Covenant church family in Roseville known for deep discipleship, global missions, and authentic community.",
        serviceStyle: "blended",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-st-olaf" },
      update: {},
      create: {
        id: "church-st-olaf",
        name: "St. Olaf Catholic Church",
        denomination: "catholic",
        address: "215 S 8th St, Minneapolis, MN 55402",
        neighborhood: "Minneapolis",
        serviceTimes: "Mon–Fri 7am, Sat 5pm, Sun 8am, 10am & 12pm",
        website: "www.stolafcatholicchurch.org",
        phone: "(612) 332-7471",
        description: "A historic downtown Minneapolis parish with beautiful traditional liturgy, a commitment to service, and a heart for the city.",
        serviceStyle: "traditional",
      },
    }),
    prisma.church.upsert({
      where: { id: "church-crossroads" },
      update: {},
      create: {
        id: "church-crossroads",
        name: "Crossroads Church",
        denomination: "non-denominational",
        address: "3150 Heritage Dr, Maple Grove, MN 55369",
        neighborhood: "Maple Grove",
        serviceTimes: "Sat 5pm, Sun 9am & 11am",
        website: "www.crossroadsmaplegrove.com",
        phone: "(763) 425-6800",
        description: "Crossroads is a growing church in Maple Grove passionate about reaching the northwest suburbs with the love of Jesus.",
        serviceStyle: "contemporary",
      },
    }),
  ]);

  console.log(`✅ Seeded ${churches.length} churches`);

  // ─── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "sarah.johnson@example.com" },
      update: {},
      create: {
        email: "sarah.johnson@example.com",
        name: "Sarah Johnson",
        passwordHash,
        neighborhood: "Edina",
        churchId: churches[2].id, // Grace Church
        bio: "Mom of 3, lover of Jesus, coffee, and community. Edina area for 10 years.",
      },
    }),
    prisma.user.upsert({
      where: { email: "mike.anderson@example.com" },
      update: {},
      create: {
        email: "mike.anderson@example.com",
        name: "Mike Anderson",
        passwordHash,
        neighborhood: "Minnetonka",
        churchId: churches[3].id, // Wooddale
        bio: "Husband, dad, contractor. Love serving my neighborhood.",
      },
    }),
    prisma.user.upsert({
      where: { email: "lisa.chen@example.com" },
      update: {},
      create: {
        email: "lisa.chen@example.com",
        name: "Lisa Chen",
        passwordHash,
        neighborhood: "Eagan",
        churchId: churches[0].id, // Bethel
        bio: "Teacher by day, Bible study leader by evening. Grateful for this community.",
      },
    }),
    prisma.user.upsert({
      where: { email: "david.walker@example.com" },
      update: {},
      create: {
        email: "david.walker@example.com",
        name: "David Walker",
        passwordHash,
        neighborhood: "Maple Grove",
        churchId: churches[10].id, // Crossroads
        bio: "Worship leader and family man. Maple Grove is home.",
      },
    }),
    prisma.user.upsert({
      where: { email: "rachel.thompson@example.com" },
      update: {},
      create: {
        email: "rachel.thompson@example.com",
        name: "Rachel Thompson",
        passwordHash,
        neighborhood: "St. Paul",
        churchId: churches[8].id, // Roseville Covenant
        bio: "Nurse, mom, and prayer warrior. St. Paul east side.",
      },
    }),
  ]);

  console.log(`✅ Seeded ${users.length} users`);

  // ─── Posts ─────────────────────────────────────────────────────────────────
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: users[0].id,
        content: "Just wanted to share how grateful I am for this community! My neighbor brought over a meal when I was sick last week — totally unprompted. This is what it means to love your neighbor. 🙏",
        category: "general",
        location: "Edina",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id,
        content: "Highly recommend Jake's Roofing in the Minnetonka area. Christian-owned, did an excellent job on our roof after the hail storm, and was totally transparent with pricing. Let me know if you want his contact info!",
        category: "recommendation",
        location: "Minnetonka",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[2].id,
        content: "Please be praying for my dad who starts chemo next week. We're trusting God through this but could use the prayer support of the community. Thank you so much. ❤️",
        category: "prayer",
        location: "Eagan",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[3].id,
        content: "I have about 30 children's books to give away — mostly ages 3-8. Great condition! Free to a good home. Just DM me and we'll figure out pickup in the Maple Grove area.",
        category: "resource",
        location: "Maple Grove",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[4].id,
        content: "Beautiful morning at Como Park today. Reminded me of Psalm 19 — 'The heavens declare the glory of God.' Thankful for spring in Minnesota, however brief it may be! 😄",
        category: "general",
        location: "St. Paul",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[0].id,
        content: "Anyone else doing the She Reads Truth advent plan? Looking for others to read along with and discuss. Would love to form a small group around it!",
        category: "general",
        location: "Edina",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[1].id,
        content: "Our family is looking for a good Christian counselor in the west metro. Marriage counseling specifically. Anyone have a recommendation they trust?",
        category: "recommendation",
        location: "Minnetonka",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[2].id,
        content: "Praise report! My mom's cancer scan came back clear. We've been praying for 6 months and God has been faithful. THANK YOU to everyone who was lifting her up. He is so good! 🙌",
        category: "general",
        location: "Eagan",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[3].id,
        content: "Starting a men's accountability group in the Maple Grove / Rogers area. Meeting bi-weekly, focused on scripture, prayer, and life. DM me if you're interested. We have 3 guys so far.",
        category: "general",
        location: "Maple Grove",
      },
    }),
    prisma.post.create({
      data: {
        userId: users[4].id,
        content: "Baby gear to give away: Pack n Play, Boppy pillow, and a baby swing. Everything works great. Free to anyone who needs it — just pick up in St. Paul near Highland Park.",
        category: "resource",
        location: "St. Paul",
      },
    }),
  ]);

  console.log(`✅ Seeded ${posts.length} posts`);

  // ─── Prayer Requests ──────────────────────────────────────────────────────
  const prayers = await Promise.all([
    prisma.prayerRequest.create({
      data: {
        authorId: users[2].id,
        content: "Please pray for my dad who is starting chemotherapy next week for colon cancer. Pray for complete healing, peace for our family, and wisdom for his doctors.",
        prayerCount: 14,
      },
    }),
    prisma.prayerRequest.create({
      data: {
        authorId: users[4].id,
        content: "Praying for direction as my husband and I discern whether to take a job opportunity that would require us to move to Dallas. We love our community here but feel God may be calling us. Wisdom please!",
        prayerCount: 8,
      },
    }),
    prisma.prayerRequest.create({
      data: {
        authorId: users[0].id,
        content: "My son is struggling with anxiety at school. He's 11 and it breaks my heart to see him afraid each morning. Pray for God's peace to guard his heart and mind.",
        isAnonymous: false,
        prayerCount: 22,
      },
    }),
    prisma.prayerRequest.create({
      data: {
        authorId: users[1].id,
        content: "Our business has had a really hard quarter. We've never faced anything like this in 12 years. Asking for prayer for breakthrough, provision, and for us to trust God's plan.",
        isAnonymous: true,
        prayerCount: 11,
      },
    }),
    prisma.prayerRequest.create({
      data: {
        authorId: users[3].id,
        content: "Lost our dog of 9 years yesterday. I know it sounds small compared to other requests, but our family is heartbroken. Praying for comfort and peace, especially for my kids.",
        prayerCount: 31,
      },
    }),
  ]);

  console.log(`✅ Seeded ${prayers.length} prayer requests`);

  // ─── Groups ───────────────────────────────────────────────────────────────
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: "Women's Bible Study — Edina/Southwest",
        description: "A warm, welcoming group of women studying scripture together. We meet weekly in homes, share life, pray for one another, and dig deep into God's Word. All women are welcome regardless of where you are in your faith journey!",
        type: "moms",
        meetingFrequency: "Thursdays at 9:30am",
        location: "Edina / Southwest Minneapolis",
        leaderId: users[0].id,
        members: {
          create: [
            { userId: users[0].id },
            { userId: users[2].id },
            { userId: users[4].id },
          ],
        },
      },
    }),
    prisma.group.create({
      data: {
        name: "Neighborhood Dads — Northwest Suburbs",
        description: "Men being men of God, together. We meet monthly for breakfast, accountability, and encouragement. If you're a dad looking for a group of brothers who will sharpen you and walk through life with you, come check us out.",
        type: "mens",
        meetingFrequency: "2nd Saturday of the month, 7:30am",
        location: "Maple Grove / Plymouth",
        leaderId: users[3].id,
        members: {
          create: [
            { userId: users[3].id },
            { userId: users[1].id },
          ],
        },
      },
    }),
    prisma.group.create({
      data: {
        name: "Young Families — Eagan/Apple Valley",
        description: "A community for parents of young kids (0-8 years). We do family events, parent nights out, share resources, and support each other through the beautiful chaos of raising young children for the Lord.",
        type: "young_families",
        meetingFrequency: "Monthly gatherings + regular playgroups",
        location: "Eagan / Apple Valley",
        leaderId: users[2].id,
        members: {
          create: [
            { userId: users[2].id },
            { userId: users[0].id },
            { userId: users[4].id },
            { userId: users[3].id },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Seeded ${groups.length} groups`);

  // ─── Businesses ──────────────────────────────────────────────────────────
  const businesses = await Promise.all([
    prisma.business.create({
      data: {
        ownerId: users[1].id,
        name: "Anderson Roofing & Exteriors",
        ownerName: "Mike Anderson",
        category: "contractors",
        description: "Family-owned roofing company serving the Twin Cities for 15 years. Specializing in residential roofing, siding, and gutters.",
        christianStatement: "We operate with full transparency and integrity in every job — treating every home like it's our own. Proverbs 11:3 guides our business.",
        phone: "(952) 555-0101",
        address: "Minnetonka, MN",
        neighborhood: "Minnetonka",
        website: "www.andersonroofing.example.com",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[0].id,
        name: "Faithful Financial Planning",
        ownerName: "Tom Richardson",
        category: "financial",
        description: "Fee-only financial planning for families. Helping Christian families steward their resources for God's glory — retirement, college planning, budgeting.",
        christianStatement: "We believe financial planning is stewardship. Every dollar belongs to God, and we help families manage it accordingly.",
        phone: "(952) 555-0102",
        address: "7900 Xerxes Ave S, Bloomington, MN",
        neighborhood: "Bloomington",
        website: "www.faithfulfinancial.example.com",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[3].id,
        name: "Cornerstone Plumbing",
        ownerName: "Steve Davis",
        category: "services",
        description: "Residential and commercial plumbing throughout the northwest suburbs. Licensed, bonded, and trustworthy.",
        christianStatement: "Built on the Cornerstone. We treat every customer with honesty and respect, because that's how Jesus calls us to serve.",
        phone: "(763) 555-0103",
        address: "Maple Grove, MN",
        neighborhood: "Maple Grove",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[4].id,
        name: "Grace Pediatrics",
        ownerName: "Dr. Amanda Brooks",
        category: "healthcare",
        description: "Pediatric primary care for children from birth to 18 years. Compassionate, faith-friendly care in the St. Paul area.",
        christianStatement: "We are honored to care for the children God has entrusted to families. Our practice treats every child with the dignity they deserve as image-bearers.",
        phone: "(651) 555-0104",
        address: "1800 Randolph Ave, St. Paul, MN",
        neighborhood: "St. Paul",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[2].id,
        name: "Light of the World Photography",
        ownerName: "Lauren Kim",
        category: "services",
        description: "Family portraits, newborns, weddings, and events. Capturing the light in your family story.",
        christianStatement: "Photography is a way of saying 'this moment matters.' I feel called to help families preserve memories of the blessings God has given them.",
        phone: "(651) 555-0105",
        neighborhood: "Eagan",
        website: "www.lotwphotography.example.com",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[0].id,
        name: "The Daily Bread Bakery",
        ownerName: "Maria Santos",
        category: "food",
        description: "Artisan bread, pastries, and cakes baked fresh daily. Custom cakes for church events, weddings, and celebrations.",
        christianStatement: "Every loaf reminds us of the Bread of Life. We bake with love and gratitude, and donate a portion of our profits to local food pantries.",
        phone: "(952) 555-0106",
        address: "4500 France Ave S, Edina, MN",
        neighborhood: "Edina",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[1].id,
        name: "Abundant Life Legal",
        ownerName: "James Mitchell",
        category: "legal",
        description: "Estate planning, wills, trusts, and family law. Clear, honest counsel to protect what matters most.",
        christianStatement: "We help families plan wisely for the future — fulfilling the Biblical call to leave an inheritance for our children's children.",
        phone: "(952) 555-0107",
        address: "2000 Plymouth Rd, Minnetonka, MN",
        neighborhood: "Minnetonka",
        website: "www.abundantlifelegal.example.com",
      },
    }),
    prisma.business.create({
      data: {
        ownerId: users[3].id,
        name: "Maple Grove Christian Academy",
        ownerName: "Pastor Kevin Hill",
        category: "education",
        description: "K-8 classical Christian education rooted in a biblical worldview. Forming hearts and minds for God's glory.",
        christianStatement: "We believe education is discipleship. Every subject is taught through the lens of God's truth, grace, and goodness.",
        phone: "(763) 555-0108",
        address: "Maple Grove, MN",
        neighborhood: "Maple Grove",
        website: "www.mgca.example.com",
      },
    }),
  ]);

  console.log(`✅ Seeded ${businesses.length} businesses`);

  // ─── Jobs ─────────────────────────────────────────────────────────────────
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        posterId: users[0].id,
        type: "babysitting",
        description: "Looking for a responsible high schooler or college student to babysit our 3 kids (ages 4, 7, 10) on Friday evenings. We attend church events most Friday nights and need reliable, patient care.",
        payRate: "$15-18/hr depending on experience",
        frequency: "Every other Friday evening, 6-10pm",
        contactMethod: "sarah.johnson@example.com",
        neighborhood: "Edina",
        familyName: "Johnson",
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[3].id,
        type: "lawn_care",
        description: "Need weekly lawn mowing, edging, and basic yard cleanup during the summer months. Backyard is large but straightforward. Equipment provided or bring your own.",
        payRate: "$45 per visit",
        frequency: "Weekly, May through October",
        contactMethod: "(763) 555-0200",
        neighborhood: "Maple Grove",
        familyName: "Walker",
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[4].id,
        type: "tutoring",
        description: "Seeking a patient tutor for my 8th grade son struggling with algebra. Would prefer a Christian young adult who can also be a positive role model. 1-2 hours per week.",
        payRate: "$20/hr",
        frequency: "1-2x per week after school",
        contactMethod: "rachel.thompson@example.com",
        neighborhood: "St. Paul",
        familyName: "Thompson",
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[2].id,
        type: "pet_sitting",
        description: "We have a golden retriever named Buddy who needs care when we travel. Looking for someone to do drop-in visits or house sitting. Buddy is well-trained and great with kids!",
        payRate: "$20/day drop-in, $50/night house sitting",
        frequency: "Occasional, usually 2-3 times per month",
        contactMethod: "lisa.chen@example.com",
        neighborhood: "Eagan",
        familyName: "Chen",
      },
    }),
  ]);

  console.log(`✅ Seeded ${jobs.length} jobs`);

  // ─── Resources ────────────────────────────────────────────────────────────
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        posterId: users[0].id,
        name: "30 Children's Books (Ages 3-8)",
        description: "A great mix of picture books and early readers including some wonderful Christian titles like 'The Jesus Storybook Bible' for kids. All in excellent condition.",
        condition: "excellent",
        category: "books",
        isFree: true,
        contactInfo: "sarah.johnson@example.com",
        neighborhood: "Edina",
      },
    }),
    prisma.resource.create({
      data: {
        posterId: users[4].id,
        name: "Pack n Play + Boppy + Baby Swing",
        description: "All three items from our youngest who is now 2. Everything works perfectly. Pack n Play barely used, Boppy washed and clean, Baby Swing runs on batteries (6v adapter works too).",
        condition: "good",
        category: "baby_gear",
        isFree: true,
        contactInfo: "rachel.thompson@example.com",
        neighborhood: "St. Paul",
      },
    }),
    prisma.resource.create({
      data: {
        posterId: users[1].id,
        name: "DeWalt 20V Drill + Circular Saw Set",
        description: "Excellent condition tool set, both tools work perfectly. Upgrading to a corded system for contractor work. Great for homeowners and DIYers.",
        condition: "excellent",
        category: "tools",
        isFree: false,
        contactInfo: "(952) 555-0201",
        neighborhood: "Minnetonka",
      },
    }),
    prisma.resource.create({
      data: {
        posterId: users[2].id,
        name: "Box of Dry Goods & Canned Food",
        description: "We're moving and want to bless someone with our pantry staples. Lots of pasta, canned beans, soups, rice, and snacks. All unexpired. Great for a family or to donate.",
        condition: "excellent",
        category: "food",
        isFree: true,
        contactInfo: "lisa.chen@example.com",
        neighborhood: "Eagan",
      },
    }),
    prisma.resource.create({
      data: {
        posterId: users[3].id,
        name: "Theology Book Collection (15 books)",
        description: "Moving and downsizing our bookshelves. Titles include C.S. Lewis, Tim Keller, John Piper, and Philip Yancey. Great condition, mostly hardcover.",
        condition: "good",
        category: "books",
        isFree: true,
        contactInfo: "david.walker@example.com",
        neighborhood: "Maple Grove",
      },
    }),
  ]);

  console.log(`✅ Seeded ${resources.length} resources`);

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Test login credentials:");
  console.log("  Email: sarah.johnson@example.com | Password: password123");
  console.log("  Email: mike.anderson@example.com | Password: password123");
  console.log("  Email: lisa.chen@example.com     | Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
