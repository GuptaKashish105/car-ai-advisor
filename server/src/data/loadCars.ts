import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Car } from "../types/car.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export function loadCars(): Car[] {
  const filePath = path.join(currentDir, "cars.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Car[];
}
