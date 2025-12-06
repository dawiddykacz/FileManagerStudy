import { NextResponse } from "next/server";
import { updateFileVisibility } from "@/lib/data/data";
import { cookies } from "next/headers";

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }
  const { id } = await params;

  const body = await request.json();
  const { visibility } = body;

  if (!["private", "public"].includes(visibility)) {
    return NextResponse.json(
      { error: "Niepoprawna wartość visibility. Dozwolone: private, public." },
      { status: 400 }
    );
  }

  await updateFileVisibility(id, visibility);

  return NextResponse.json({
    message: `Visibility pliku zaktualizowana na '${visibility}'.`
  });
}
