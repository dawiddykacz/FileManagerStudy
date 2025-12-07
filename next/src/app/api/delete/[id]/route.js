import { NextResponse } from "next/server";
import { deleteFileDate } from "@/lib/data/data";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  const { id } = await params;

  const c = await cookies();
  const username = c.get("username")?.value;
  if (!username) return NextResponse.redirect("/login");

  await deleteFileDate(username, id);

  return NextResponse.redirect(new URL("/filemanager", request.url));
}
