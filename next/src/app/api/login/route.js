import { getUser } from "@/lib/data/users";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const { username, password } = await req.json();

  const user = getUser(username);

  if (!user) {
    return NextResponse.json(
      { message: "Nieprawidłowy login lub hasło." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { message: "Nieprawidłowy login lub hasło." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ message: "Zalogowano pomyślnie" });
  response.cookies.set({
    name: "username",
    value: user.username,
    httpOnly: true,
    maxAge: 60 * 60, // 1h
    path: "/",
  });

  return response;
};
