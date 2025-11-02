import { NextResponse } from "next/server";
import { removePin } from "@/lib/pins";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pinId = params.id;
    if (!pinId) {
      return NextResponse.json({ message: "Ungültige Pin-ID." }, { status: 400 });
    }

    const removed = await removePin(pinId);

    if (!removed) {
      return NextResponse.json({ message: "Pin wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ message: "Pin wurde gelöscht." });
  } catch (error) {
    console.error("Failed to delete pin", error);
    return NextResponse.json(
      { message: "Der Pin konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}
