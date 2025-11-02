"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

type Pin = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

type FormState = {
  title: string;
  description: string;
};

const defaultCenter: [number, number] = [48.392578, 10.011085];

const defaultIcon = L.divIcon({
  className: "pin-marker",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
  html: `
    <span class="pin-marker__pin"></span>
    <span class="pin-marker__shadow"></span>
  `,
});

function MapClickHandler({ onClick }: { onClick: (event: LeafletMouseEvent) => void }) {
  useMapEvents({
    click(event) {
      onClick(event);
    },
  });
  return null;
}

export function MapView() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPinLocation, setNewPinLocation] = useState<[number, number] | null>(null);
  const [formState, setFormState] = useState<FormState>({ title: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPins = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pins", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Pins");
      }
      const data = (await response.json()) as Pin[];
      setPins(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Die Pins konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    setNewPinLocation([event.latlng.lat, event.latlng.lng]);
    setFormState({ title: "", description: "" });
  }, []);

  const submitNewPin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newPinLocation) {
        return;
      }

      if (!formState.title.trim()) {
        setError("Bitte gib dem Pin einen Titel.");
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await fetch("/api/pins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formState.title.trim(),
            description: formState.description.trim() || undefined,
            latitude: newPinLocation[0],
            longitude: newPinLocation[1],
          }),
        });

        if (!response.ok) {
          throw new Error("Fehler beim Speichern des Pins");
        }

        const createdPin = (await response.json()) as Pin;
        setPins((previous) => [createdPin, ...previous]);
        setNewPinLocation(null);
        setFormState({ title: "", description: "" });
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Der Pin konnte nicht gespeichert werden.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState.description, formState.title, newPinLocation]
  );

  const handleDelete = useCallback(
    async (pinId: string) => {
      const confirmed = window.confirm("Möchtest du diesen Pin wirklich löschen?");
      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(pinId);
        const response = await fetch(`/api/pins/${pinId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Fehler beim Löschen des Pins");
        }

        setPins((previous) => previous.filter((pin) => pin.id !== pinId));
      } catch (err) {
        console.error(err);
        setError("Der Pin konnte nicht gelöscht werden.");
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  const markers = useMemo(
    () =>
      pins.map((pin) => (
        <Marker key={pin.id} position={[pin.latitude, pin.longitude]} icon={defaultIcon}>
          <Popup>
            <div className="space-y-2">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">{pin.title}</h3>
                {pin.description ? (
                  <p className="text-sm text-zinc-600 whitespace-pre-wrap">{pin.description}</p>
                ) : (
                  <p className="text-sm italic text-zinc-500">Keine Beschreibung hinterlegt.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(pin.id)}
                className="w-full rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                disabled={deletingId === pin.id}
              >
                {deletingId === pin.id ? "Wird gelöscht..." : "Pin löschen"}
              </button>
            </div>
          </Popup>
        </Marker>
      )),
    [deletingId, handleDelete, pins]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Karte der CSU Neu-Ulm</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Tippe oder klicke auf die Karte, um einen neuen Standort für ein Plakat zu setzen. Jeder Pin ist für alle
          sichtbar und kann mit einem Titel sowie einer optionalen Beschreibung versehen werden.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : null}
        {isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Pins werden geladen...</p>
        ) : null}
      </div>
      <div className="flex-1 overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          className="h-[70vh] w-full md:h-[calc(100vh-220px)]"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          {markers}
          {newPinLocation ? (
            <Marker position={newPinLocation} icon={defaultIcon}>
              <Popup>
                <form className="space-y-3" onSubmit={submitNewPin}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-900" htmlFor="pin-title">
                      Titel
                    </label>
                    <input
                      id="pin-title"
                      type="text"
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((previous) => ({ ...previous, title: event.target.value }))
                      }
                      required
                      placeholder="Zum Beispiel: Plakat Laternenmast"
                      className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-900" htmlFor="pin-description">
                      Beschreibung (optional)
                    </label>
                    <textarea
                      id="pin-description"
                      value={formState.description}
                      onChange={(event) =>
                        setFormState((previous) => ({ ...previous, description: event.target.value }))
                      }
                      rows={3}
                      placeholder="Notizen zur Platzierung, z. B. Seite der Straße oder Besonderheiten"
                      className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setNewPinLocation(null)}
                      className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                      disabled={isSubmitting}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Speichern..." : "Pin speichern"}
                    </button>
                  </div>
                </form>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
