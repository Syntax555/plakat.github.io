import { NextRequest, NextResponse } from "next/server";
import { removePin } from "@/lib/pins";

type Params = { id: string };

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Ungültige Pin-ID." },
        { status: 400 }
      );
    }

    const removed = await removePin(id);

    if (!removed) {
      return NextResponse.json(
        { message: "Pin wurde nicht gefunden." },
        { status: 404 }
      );
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
