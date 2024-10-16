
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  
  try {
    // Log the profile value
    const profile = await currentProfile();
    console.log("Profile: ", profile); // Add this

    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    console.log("Server ID: ", serverId); // Add this
    console.log("Name: ", name); // Add this
    console.log("Type: ", type); // Add this

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    if (name === "general" || name === "General") {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    // Log the server response
    console.log("Server updated: ", server); // Add this
    console.log(profile)

    return NextResponse.json(server);
  } catch (error) {
    console.error("Error: ", error); // This logs any caught errors
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
