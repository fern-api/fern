async function timingSafeEqualNode(a: string, b: string): Promise<boolean> {
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

function timingSafeEqualBrowser(a: string, b: string): boolean {
    const encoder = new TextEncoder();
    const bytesA = encoder.encode(a);
    const bytesB = encoder.encode(b);

    if (bytesA.length !== bytesB.length) {
        // Still iterate to avoid timing leaks on length.
        // Use result in the return to prevent the engine from optimizing the loop away.
        let result = 1;
        for (let i = 0; i < bytesA.length; i++) {
            result |= bytesA[i]! ^ (bytesB[i % (bytesB.length || 1)] ?? 0);
        }
        return result < 0;
    }

    let result = 0;
    for (let i = 0; i < bytesA.length; i++) {
        result |= bytesA[i]! ^ bytesB[i]!;
    }
    return result === 0;
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
    if (typeof process !== "undefined" && process.versions?.node) {
        return timingSafeEqualNode(a, b);
    }
    return timingSafeEqualBrowser(a, b);
}
