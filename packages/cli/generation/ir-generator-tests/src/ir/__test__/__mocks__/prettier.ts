import { vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
export const format: any = vi.fn((code: string) => code);
