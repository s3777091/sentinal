import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch data based on userId
    const scans = await prisma.scanData.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        level: true,
        more_detail: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(JSON.stringify(scans), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Something went wrong when processing the request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
