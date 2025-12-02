"use client";

import { useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Błąd logowania");
      return;
    }

    document.cookie = `token=${data.token}; path=/; max-age=604800`;

    window.location.href = "/"; 
  }

  async function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Błąd rejestracji");
      return;
    }

    setMessage("Rejestracja OK. Możesz się zalogować.");
  }

  return (
    <div>
      <h2>Logowanie</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleLogin}>
        <input type="text" name="username" placeholder="Nazwa użytkownika" required />
        <input type="password" name="password" placeholder="Hasło" required />
        <button type="submit">Zaloguj</button>
      </form>

      <p>Nie masz konta? Zarejestruj się</p>

      <form onSubmit={handleRegister}>
        <input type="text" name="username" placeholder="Nazwa użytkownika" required />
        <input type="password" name="password" placeholder="Hasło" required />
        <button type="submit">Zarejestruj</button>
      </form>
    </div>
  );
}
