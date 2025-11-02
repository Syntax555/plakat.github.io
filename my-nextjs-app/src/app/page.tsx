import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./map-view").then((module) => module.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-sm text-zinc-500">
      Karte wird geladen...
    </div>
  ),
});

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="bg-blue-900 px-6 py-5 text-white shadow">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-200">CSU Neu-Ulm</p>
            <h1 className="text-2xl font-semibold">Plakat-Planung auf einen Blick</h1>
          </div>
          <p className="text-sm text-blue-100">
            Verwalte eure Plakatstandorte und halte das Team stets auf dem Laufenden.
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <MapView />
      </main>
      <footer className="bg-blue-900/90 px-6 py-4 text-xs text-blue-100">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} CSU Neu-Ulm.</p>
          <p>Diese Karte basiert auf Daten von OpenStreetMap.</p>
        </div>
      </footer>
    </div>
  );
}
