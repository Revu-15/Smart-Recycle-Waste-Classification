import { NextResponse } from "next/server";
import { prisma, ensureDatabaseTables } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { shouldProxyToBackend, proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  if (shouldProxyToBackend()) {
    const proxied = await proxyToBackend(request, "/api/auth/login");
    if (proxied) return proxied;
  }

  try {
    await ensureDatabaseTables();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[auth/login] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to sign in. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
