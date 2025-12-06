import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assignUserToFile } from "@/lib/data/data";

export async function POST(request, { params }) {
  const { id } = await params;

  const formData = await request.formData();
  const usernameToAssign = formData.get("username"); 

  const owner = cookies().get("username")?.value;
  if (!owner) return NextResponse.redirect("/login");

  await assignUserToFile(owner, usernameToAssign, id);

  return NextResponse.redirect("/filemanager");
}
