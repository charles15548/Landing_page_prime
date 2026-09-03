"use client";

import { useEffect } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.prime.app_tkd";

export default function GetApp() {
  useEffect(() => {
    window.location.replace(PLAY_STORE_URL);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div>
        <h2>Abriendo Google Play...</h2>

        <p>
          Si no se abre automáticamente,{" "}
          <a href={PLAY_STORE_URL}>toca aquí</a>.
        </p>
      </div>
    </main>
  );
}