import { RUNTIME } from "../runtime";

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
    if (RUNTIME.type === "node") {
        const crypto = await import("crypto");
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length) {
            // Still perform comparison to avoid leaking length via timing
            const dummy = Buffer.alloc(bufA.length);
            crypto.timingSafeEqual(bufA, dummy);
            return false;
        }
        return crypto.timingSafeEqual(bufA, bufB);
    }

    // Fallback: constant-time XOR comparison using Uint8Array
    const enc = new TextEncoder();
    const bytesA = enc.encode(a);
    const bytesB = enc.encode(b);
    if (bytesA.length !== bytesB.length) {
        // XOR each byte of bytesA against bytesB[0] (a runtime value) so the
        // loop cannot be trivially folded to a constant by the engine. This is
        // best-effort timing-stability: JS has no guarantee, but we avoid an
        // obvious early-exit that would trivially leak length via timing.
        const pivot = bytesB[0] ?? 0;
        let sink = 0;
        for (let i = 0; i < bytesA.length; i++) {
            sink |= bytesA[i]! ^ pivot;
        }
        void sink;
        return false;
    }
    let result = 0;
    for (let i = 0; i < bytesA.length; i++) {
        result |= bytesA[i]! ^ bytesB[i]!;
    }
    return result === 0;
}
