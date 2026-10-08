import { NextResponse } from "next/server";

const SESSION_COOKIE = "aerospace_session";

function logoutResponse(request: Request) {
  const response = NextResponse.redirect(
    new URL("/login", request.url),
    303
  );

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}

export async function GET(request: Request) {
  return logoutResponse(request);
}

export async function POST(request: Request) {
  return logoutResponse(request);
}
