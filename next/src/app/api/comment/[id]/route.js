import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addComment } from "@/lib/data/data";

export async function POST(request, { params }) {
  const { id } = await params;

  const form = await request.formData();
  const comment = form.get("comment");

  const c = await cookies();
  const username = c.get("username")?.value;

  if (!username) {
    return NextResponse.redirect("/login");
  }

  await addComment(id, username, comment);

  return NextResponse.redirect(new URL("/comments/"+id, request.url));
}
