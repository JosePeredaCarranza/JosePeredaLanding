"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="legal wrap"><h1>No pudimos cargar la página.</h1><p>Inténtalo de nuevo en unos instantes.</p><button className="button" onClick={reset}>Volver a intentar</button></main>;}
