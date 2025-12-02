import { getUser, userExists, addUser } from "@/lib/data/users";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const { username, password } = await req.json();

  if (userExists(username)) {
    return NextResponse.json(
      { message: "Użytkownik istnieje." },
      { status: 400 }
    );
  }

  await addUser(username, password);

  const user = getUser(username);

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: "username",
    value: user.username,
    httpOnly: true,
    maxAge: 3600,
    path: "/",
  });

  return response;
};
