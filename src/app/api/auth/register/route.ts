import { NextResponse } from "next/server";
import { prisma, ensureDatabaseTables } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { shouldProxyToBackend, proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  if (shouldProxyToBackend()) {
    const proxied = await proxyToBackend(request, "/api/auth/register");
    if (proxied) return proxied;
  }

  try {
    await ensureDatabaseTables();

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[auth/register] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create account. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
