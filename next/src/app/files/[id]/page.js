import React from "react";
import { getFileData } from "@/lib/data/data";
import { getPresignedUrl } from "@/lib/data/fileStorage";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FilePreviewPage({ params }) {
  const { id } = await params;
  

  const fi = await getFileData(id);

  if (!fi) {
    redirect("/filemanager");
  }

  const { name, file, version, ownerName } = fi;

  if (!file || !name) {
    
    redirect("/filemanager");
  }

  const url = await getPresignedUrl(id + "v" + version);
  const contentType = file.ContentType || "application/octet-stream";

  return (
    <div>
      <h1>
        Podgląd: {name} Wersja {version} Właściciel {ownerName}
      </h1>
      <div className="el-prev">
         {contentType.startsWith("image/") ? (
        <img width="100%" src={url} alt={name} />
      ) : contentType === "application/pdf" ? (
        <iframe src={url} width="100%" height="800px"></iframe>
      ) : contentType.startsWith("text/") ||
        contentType.includes("json") ||
        contentType.includes("csv") ? (
        <pre id="textPreview">Wczytywanie...</pre>
      ) : (
        <p>❌ Ten format pliku ({contentType}) nie jest obsługiwany w podglądzie.</p>
      )}

      {(contentType.startsWith("text/") ||
        contentType.includes("json") ||
        contentType.includes("csv")) && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
            fetch('${url}', { mode: 'cors' })
              .then(res => res.text())
              .then(text => document.getElementById('textPreview').textContent = text)
              .catch(() => document.getElementById('textPreview').textContent = 'Błąd ładowania pliku.');
          `,
          }}
        />
      )}
      </div>
    </div>
  );
}
