import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMultipleApiServers() {
  try {
    const newApiServers = await prisma.apiServer.createMany({
      data: [
        { apiUrl: "cyberapi", status: "low" },
        { apiUrl: "cyberapi_1", status: "low" },
      ],
      skipDuplicates: true, // Optional: skips inserting records if they have duplicate unique constraints
    });
    
    console.log(`${newApiServers.count} ApiServers created`);
  } catch (error) {
    console.error("Error creating ApiServers:", error);
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma when done
  }
}

createMultipleApiServers();