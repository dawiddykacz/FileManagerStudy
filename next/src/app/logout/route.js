import { NextResponse } from "next/server";

export const GET = (req) => {
  const response = NextResponse.redirect(new URL("/login", req.url)); // req.url to pełny URL aktualnego requesta
  response.cookies.set({
    name: "username",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
};