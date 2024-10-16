import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    // Check for valid profile
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check for server ID
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // Check for channel ID
    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Perform the deletion
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
          delete: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[CHANNEL_ID_DELETE_ERROR]", error);
    
    // Handle Prisma specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse("Database Error", { status: 500 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    // Check for valid profile
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check for server ID
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // Check for channel ID
    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Validate channel name
    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    // Perform the update
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
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[CHANNEL_ID_PATCH_ERROR]", error);
    
    // Handle Prisma specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse("Database Error", { status: 500 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
