import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Pin = {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type PinInput = {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
};

const dataDirectory = path.join(process.cwd(), "data");
const pinsFilePath = path.join(dataDirectory, "pins.json");

async function ensureDataFile() {
  try {
    await fs.access(pinsFilePath);
  } catch {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.writeFile(pinsFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readPins(): Promise<Pin[]> {
  await ensureDataFile();
  const fileContent = await fs.readFile(pinsFilePath, "utf-8");
  try {
    return JSON.parse(fileContent) as Pin[];
  } catch {
    return [];
  }
}

async function writePins(pins: Pin[]) {
  await fs.writeFile(pinsFilePath, JSON.stringify(pins, null, 2), "utf-8");
}

export async function getPins(): Promise<Pin[]> {
  const pins = await readPins();
  return pins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addPin(input: PinInput): Promise<Pin> {
  const now = new Date().toISOString();
  const pin: Pin = {
    id: randomUUID(),
    title: input.title,
    description: input.description?.trim() || undefined,
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt: now,
  };

  const pins = await readPins();
  pins.push(pin);
  await writePins(pins);
  return pin;
}

export async function removePin(id: string): Promise<boolean> {
  const pins = await readPins();
  const filteredPins = pins.filter((pin) => pin.id !== id);

  if (filteredPins.length === pins.length) {
    return false;
  }

  await writePins(filteredPins);
  return true;
}
