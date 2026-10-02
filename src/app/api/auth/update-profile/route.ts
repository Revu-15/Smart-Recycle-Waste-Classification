import { NextResponse } from "next/server";
import { prisma, ensureDatabaseTables } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { shouldProxyToBackend, proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  if (shouldProxyToBackend()) {
    const proxied = await proxyToBackend(request, "/api/auth/update-profile");
    if (proxied) return proxied;
  }

  try {
    await ensureDatabaseTables();

    const body = await request.json();
    const { email, name, currentPassword, newPassword } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "User email is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updateData: { name?: string; password?: string } = {};

    if (name && typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Please enter your current password to set a new password." }, { status: 400 });
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
      }

      const isCurrentValid = verifyPassword(currentPassword, user.password);
      if (!isCurrentValid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }

      updateData.password = hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: newPassword ? "Profile and password updated successfully!" : "Profile updated successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("[auth/update-profile] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update profile.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
