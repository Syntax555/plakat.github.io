import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { removePin } from "@/lib/pins";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pinId } = await context.params;
    if (!pinId) {
      return NextResponse.json({ message: "Ungueltige Pin-ID." }, { status: 400 });
    }

    const removed = await removePin(pinId);

    if (!removed) {
      return NextResponse.json({ message: "Pin wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ message: "Pin wurde geloescht." });
  } catch (error) {
    console.error("Failed to delete pin", error);
    return NextResponse.json(
      { message: "Der Pin konnte nicht geloescht werden." },
      { status: 500 }
    );
  }
}
