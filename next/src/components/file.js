"use client";

import { useState } from "react";

export default function FileCard({
  id,
  name,
  type,
  visibility,
  ownerName,
  v,
  isDisplayable,
}) {
  const [currentVisibility, setCurrentVisibility] = useState(visibility);

  async function toggleVisibility() {
    const newVisibility = currentVisibility === "private" ? "public" : "private";

    try {
      const res = await fetch(`/api/files/${id}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentVisibility(newVisibility);
        alert(data.message);
      } else {
        alert(data.error || "Błąd aktualizacji visibility");
      }
    } catch (err) {
      console.error(err);
      alert("Błąd połączenia z serwerem");
    }
  }

  return (
    <div className="card">

      <div className="details">
        <p>
          id: <span className="detail">{id}</span>
        </p>
        <p>
          Name: <span className="detail">{name}</span>
        </p>
        <p>
          Visibility: <span>{currentVisibility}</span>
        </p>
        <p>
          Właściciel <span>{ownerName}</span>
        </p>
      </div>

      <div className="buttons">
        <a href={`/files/${id}`}>
          <button className="button">Podgląd</button>
        </a>

        <a href={`/comments/${id}`}>
          <button className="button">Komentarze</button>
        </a>

        {v && (
          <>
            <a href={`/info/${id}`}>
              <button className="button">Info</button>
            </a>

            <a href={`/delete/${id}`}>
              <button className="button">Delete</button>
            </a>

            <a href={`/history/${id}`}>
              <button className="button">Historia</button>
            </a>

            <button className="button" onClick={toggleVisibility}>
              Zmień dostępność
            </button>

            <form
              method="POST"
              action={`/api/filemanager/${id}`}
              encType="multipart/form-data"
            >
              <input type="file" name="file" required multiple />
              <input className="button" type="submit" value="Wgraj nową wersję" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
