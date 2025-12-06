import { getFileData } from "@/lib/data/data";
import { redirect } from "next/navigation";
import React from "react";
import { cookies } from "next/headers";
import Comment from "@/components/comment";

export const dynamic = "force-dynamic";

export default async function CommentsPage({ params }) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }
  const { id } = params;

  const file = await getFileData(id);
  if (!file) redirect("/filemanager");

  const { name, ownerName, comments } = file;

  return (
    <div className="wrapper wrapper-center white-space-pre-line">
      <div>
        <h1>
          Nowy Komentarz {name} Właściciel {ownerName}
        </h1>

        <form action={`/api/comment/${id}`} method="POST">
          <input
            type="text"
            name="comment"
            placeholder="Komentarz"
            required
          />
          <button type="submit">Udostępnij</button>
        </form>
      </div>

      <div className="wrapper wrapper-center white-space-pre-line">
        <h1>Komentarze</h1>

        {comments?.length > 0 ? (
          comments.map((c, idx) => (
            <Comment key={idx} {...c}></Comment>
          ))
        ) : (
          <p>Brak komentarzy.</p>
        )}
      </div>
    </div>
  );
}
