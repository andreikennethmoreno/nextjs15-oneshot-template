"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId, // Now matches schema (id = Clerk ID)
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        // role defaults to USER automatically
        // themeId is optional, leave out for now
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
  }
}
