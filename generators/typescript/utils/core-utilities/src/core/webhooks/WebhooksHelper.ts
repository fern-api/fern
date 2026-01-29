export class WebhooksHelper {
    private static async createHmac(payload: string, key: string): Promise<string> {
        try {
            const crypto = require("crypto");
            const hmac = crypto.createHmac("sha256", key);
            hmac.update(payload, "utf8");
            return hmac.digest("base64");
        } catch (_err) {
            // Not in Node environment; use subtle crypto.
        }
        const subtleCrypto = this.getSubtleCrypto();
        if (!subtleCrypto) {
            throw new Error("No crypto implementation available");
        }
        const encoder = new TextEncoder();
        const cryptoKey = await subtleCrypto.importKey(
            "raw",
            encoder.encode(key),
            {
                name: "HMAC",
                hash: { name: "SHA-256" },
            },
            false,
            ["sign"]
        );
        const signatureBuffer = await subtleCrypto.sign("HMAC", cryptoKey, encoder.encode(payload));
        return this.arrayBufferToBase64(signatureBuffer);
    }

    private static getSubtleCrypto(): SubtleCrypto | undefined {
        if (typeof window !== "undefined" && window?.crypto?.subtle) {
            return window.crypto.subtle;
        }
        return undefined;
    }

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        if (typeof btoa === "function") {
            // Browser environment
            const bytes = new Uint8Array(buffer);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]!);
            }
            return btoa(binary);
        } else {
            // Node environment
            return Buffer.from(buffer).toString("base64");
        }
    }

    /**
     * Verifies and validates an event notification.
     *
     * @param requestBody       The JSON body of the request.
     * @param signatureHeader   The value of the signature header from the webhook request.
     * @param secret            The secret key used to sign the webhook payload.
     * @param notificationUrl   The notification endpoint URL (optional, used by some providers).
     * @returns                 `true` if the signature is valid, indicating that the event can be trusted.
     *                          `false` if the signature validation fails, indicating that the event may be malicious.
     */
    static async verifySignature({
        requestBody,
        signatureHeader,
        secret,
        notificationUrl,
    }: {
        requestBody: string;
        signatureHeader: string;
        secret: string;
        notificationUrl?: string;
    }): Promise<boolean> {
        if (requestBody == null) {
            return false;
        }
        if (secret == null || secret.length === 0) {
            throw new Error("secret is null or empty");
        }
        try {
            const payload = notificationUrl != null ? notificationUrl + requestBody : requestBody;
            const hashBase64 = await this.createHmac(payload, secret);
            return hashBase64 === signatureHeader;
        } catch (error) {
            throw new Error(
                `Failed to validate webhook signature: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}
