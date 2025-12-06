
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FileCard from "@/components/file";
import { getFilesData } from "@/lib/data/data";

export const dynamic = "force-dynamic";

export default async function FileManagerPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }

  const files = await getFilesData(username); 

  return (
    <div className="files">
      {files.map((file) => (
        <FileCard key={file.id} {...file} />
      ))}
    </div>
  );
}
