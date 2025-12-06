import { cookies } from "next/headers";
import FilePreview from "@/components/pa";
import { getFileData } from "@/lib/data/data";
import { redirect } from "next/navigation";

export default async function HistoryPage({ params }) {
  const { id } = await params;

  const file = await getFileData(id);
  
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) {
    redirect("/login");
  }

  if (!file || !file.versions) {
    redirect("/filemanager");
  }

  const { versions, ownerName, name } = file;

  return (
    <div>
      <h1>Podgląd: {name} Właściciel {ownerName}</h1>

      {versions.map(v => (
        <FilePreview key={v.version} {...v} />
      ))}
    </div>
  );
}
