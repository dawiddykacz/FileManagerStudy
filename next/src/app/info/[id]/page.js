import Access from "@/components/acl";
import { getFileData } from "@/lib/data/data";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import React from "react";

export const dynamic = "force-dynamic";

export default async function InfoPage({ params }) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }

  const { id } = await params;

  const file = await getFileData(id);

  if (!file) {
    redirect("/filemanager");
  }

  const { name, version, ownerName, access } = file;

  return (
    <div className="wrapper wrapper-center white-space-pre-line">
      <div>
        <h1>
          Udostępnij plik: {name} Wersja {version} Właściciel {ownerName}
        </h1>

        <form action={`/api/add_acl/${id}`} method="POST">
          <input
            type="text"
            name="username"
            placeholder="Nazwa użytkownika"
            required
          />
          <button type="submit">Udostępnij</button>
        </form>
      </div>

      <div>
        
        <h1>Udostępnienia</h1>

        {access?.length > 0 ? (
          access.map((a) => (
            <Access key={a.username} username={a.username}></Access>
          ))
        ) : (
          <p>Brak udostępnień.</p>
        )}
      </div>
    </div>
  );
}
