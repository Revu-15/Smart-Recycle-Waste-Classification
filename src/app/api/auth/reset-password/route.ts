import { NextResponse } from "next/server";
import { prisma, ensureDatabaseTables } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { shouldProxyToBackend, proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  if (shouldProxyToBackend()) {
    const proxied = await proxyToBackend(request, "/api/auth/reset-password");
    if (proxied) return proxied;
  }

  try {
    await ensureDatabaseTables();

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your email or create a new account." },
        { status: 404 }
      );
    }

    const hashedPassword = hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your password has been reset successfully. You can now sign in.",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/reset-password] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to reset password. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
