import { NextRequest, NextResponse } from "next/server";
import { addPin, getPins } from "@/lib/pins";

export async function GET(_request: NextRequest) {
  const pins = await getPins();
  return NextResponse.json(pins);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : undefined;
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!title) {
      return NextResponse.json(
        { message: "Titel ist erforderlich." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { message: "Ungültige Koordinaten." },
        { status: 400 }
      );
    }

    const newPin = await addPin({
      title,
      description,
      latitude,
      longitude,
    });

    return NextResponse.json(newPin, { status: 201 });
  } catch (error) {
    console.error("Failed to create pin", error);
    return NextResponse.json(
      { message: "Der Pin konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}
