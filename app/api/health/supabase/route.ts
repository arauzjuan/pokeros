import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return NextResponse.json(
      { connected: false, error: "Supabase environment is not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
    });

    return NextResponse.json(
      { connected: response.ok, status: response.status },
      { status: response.ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      { connected: false, error: "Supabase is unreachable" },
      { status: 503 },
    );
  }
}
