
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import React from "react";

export const dynamic = 'force-dynamic';
export default async function UploadPage() {
  const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;

    if (!username) {
        redirect("/login");
    }

  return (
    <div>
      <h2>Upload plików</h2>
      <form method="POST" action="/api/upload" encType="multipart/form-data">
        <input type="file" name="file" required multiple />
        <input className="button" type="submit" value="Upload" />
      </form>
    </div>
  );
}
