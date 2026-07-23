import { getWebhookQueryParameter } from "../../../src/core/webhooks/getWebhookQueryParameter";

describe("getWebhookQueryParameter", () => {
    it("extracts a query parameter value from the notification URL", () => {
        const url = "https://example.com/webhooks/sms?bodySHA256=abc123";
        expect(getWebhookQueryParameter(url, "bodySHA256")).toBe("abc123");
    });

    it("returns undefined when the parameter is absent", () => {
        const url = "https://example.com/webhooks/sms?foo=bar";
        expect(getWebhookQueryParameter(url, "bodySHA256")).toBeUndefined();
    });

    it("returns undefined for an unparseable URL", () => {
        expect(getWebhookQueryParameter("not a url", "bodySHA256")).toBeUndefined();
    });

    it("reads the parameter without reordering other query parameters", () => {
        // The verbatim URL (including param order) is what the outer HMAC signs, so
        // extraction must be read-only.
        const url = "https://example.com/hook?a=1&bodySHA256=deadbeef&z=2";
        expect(getWebhookQueryParameter(url, "bodySHA256")).toBe("deadbeef");
    });

    it("returns the first value when a parameter appears multiple times", () => {
        const url = "https://example.com/hook?bodySHA256=first&bodySHA256=second";
        expect(getWebhookQueryParameter(url, "bodySHA256")).toBe("first");
    });
});
