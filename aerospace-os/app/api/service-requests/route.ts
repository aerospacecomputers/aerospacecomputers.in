import { NextResponse } from "next/server";

// Demo-only API route. Replace the in-memory store with the shared Aerospace OS DB.
const requests: any[] = [];

export async function GET() {
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const body = await req.json();
  const request = {
    id: `SR-${new Date().getFullYear()}-${String(requests.length + 126).padStart(5, "0")}`,
    ...body,
    status: "Submitted",
    createdAt: new Date().toISOString(),
    source: body.source ?? "website",
  };
  requests.unshift(request);
  return NextResponse.json({ request }, { status: 201 });
}
