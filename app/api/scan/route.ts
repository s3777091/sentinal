import { PrismaClient } from "@prisma/client";

export async function POST(req: Request): Promise<Response> {
    try {
        const prisma = new PrismaClient();
        const { user } = await req.json();

        if (!user || (!user.email && !user.username)) {
            return new Response(JSON.stringify({ error: "Invalid username object" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const ex_User = await prisma.user.findFirst({
            where: {
                OR: [{ email: user.email }, { username: user.username }],
            }
        });

        if (!ex_User) {
            console.error("User not found.");
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const scans = await prisma.scanData.findMany({
            where: {
                userId: ex_User.id,
            },
            select: {
                id: true,
                title: true,
                level: true,
                more_detail: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return new Response(JSON.stringify(scans), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Something went wrong when processing the request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}