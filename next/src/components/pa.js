"use client";

import { useEffect, useState } from "react";

export default function FilePreview({
  name,
  version,
  ownerName,
  contentType,
  url,
}) {
  const [textContent, setTextContent] = useState("Wczytywanie...");

  // Czy typ jest obrazem
  const isImage = contentType.startsWith("image/");

  // Czy PDF
  const isPDF = contentType === "application/pdf";

  // Czy tekst/csv/json
  const isText =
    contentType.startsWith("text/") ||
    contentType.includes("json") ||
    contentType.includes("csv");

  useEffect(() => {
    if (!isText) return;

    fetch(url, { mode: "cors" })
      .then((res) => res.text())
      .then((txt) => setTextContent(txt))
      .catch(() => setTextContent(`Błąd ładowania pliku: ${url}`));
  }, [url, isText]);

  return (
    <div>
      <h1>
        Podgląd: {name} Wersja {version} Właściciel {ownerName}
      </h1>

      <div className="el-prev">
        {isImage && <img width="100%" src={url} alt={name} />}

      {!isImage && isPDF && (
        <iframe src={url} width="100%" height="800px"></iframe>
      )}

      {!isImage && !isPDF && isText && (
        <pre id={`textPreview${version}`}>{textContent}</pre>
      )}

      {!isImage && !isPDF && !isText && (
        <p>
          ❌ Ten format pliku ({contentType}) nie jest obsługiwany w podglądzie.
        </p>
      )}
      </div>
    
    </div>
  );
}
