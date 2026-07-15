import { PrismaClient, Role, ResourceCategory, UrgencyLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const coordinator = await prisma.user.upsert({
    where: { email: "coordinator@relieflink.org" },
    update: {},
    create: {
      name: "Ava Coordinator",
      email: "coordinator@relieflink.org",
      passwordHash,
      role: Role.COORDINATOR,
      organization: "ReliefLink HQ",
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: "requester@example.com" },
    update: {},
    create: {
      name: "Jordan Requester",
      email: "requester@example.com",
      passwordHash,
      role: Role.REQUESTER,
      phone: "555-0100",
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: "volunteer@example.com" },
    update: {},
    create: {
      name: "Sam Volunteer",
      email: "volunteer@example.com",
      passwordHash,
      role: Role.VOLUNTEER,
      organization: "Community Relief Co-op",
    },
  });

  await prisma.helpRequest.create({
    data: {
      requesterId: requester.id,
      title: "Family of 4 needs shelter after flooding",
      description:
        "Our home flooded overnight, we have two young children and an elderly grandparent with limited mobility. We need temporary shelter for at least a week.",
      category: ResourceCategory.SHELTER,
      headcount: 4,
      location: "Riverside District, Block 12",
      urgency: UrgencyLevel.HIGH,
      aiUrgencyScore: 8,
      aiSummary: "Family of 4 including a mobility-limited elder displaced by flooding; needs immediate temporary shelter.",
    },
  });

  await prisma.resourceOffer.create({
    data: {
      volunteerId: volunteer.id,
      title: "Spare rooms available - up to 4 people",
      description: "We have a community hall with cots, blankets, and basic kitchen access.",
      category: ResourceCategory.SHELTER,
      quantity: 4,
      location: "Riverside District, Block 15",
    },
  });

  console.log("Seed complete:", { coordinator: coordinator.email, requester: requester.email, volunteer: volunteer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
