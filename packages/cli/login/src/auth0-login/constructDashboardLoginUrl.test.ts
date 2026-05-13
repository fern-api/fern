import { describe, expect, it } from "vitest";
import { constructDashboardLoginUrl } from "./constructDashboardLoginUrl.js";

describe("constructDashboardLoginUrl", () => {
    const base = {
        dashboardBaseUrl: "https://dashboard.buildwithfern.com",
        auth0ClientId: "syaWnk6SjNoo5xBf1omfvziU3q7085lh",
        redirectUri: "http://localhost:3129",
        audience: "venus-prod"
    };

    it("builds a minimal /cli-login URL", () => {
        const url = new URL(constructDashboardLoginUrl(base));
        expect(url.origin).toBe("https://dashboard.buildwithfern.com");
        expect(url.pathname).toBe("/cli-login");
        expect(url.searchParams.get("client_id")).toBe(base.auth0ClientId);
        expect(url.searchParams.get("redirect_uri")).toBe(base.redirectUri);
        expect(url.searchParams.get("audience")).toBe("venus-prod");
        expect(url.searchParams.get("state")).toBeNull();
        expect(url.searchParams.get("prompt")).toBeNull();
    });

    it("forwards state and prompt when provided", () => {
        const url = new URL(constructDashboardLoginUrl({ ...base, state: "csrf-state", prompt: "login" }));
        expect(url.searchParams.get("state")).toBe("csrf-state");
        expect(url.searchParams.get("prompt")).toBe("login");
    });

    it("strips a trailing slash on the dashboard base URL", () => {
        const url = new URL(
            constructDashboardLoginUrl({ ...base, dashboardBaseUrl: "https://dashboard.buildwithfern.com/" })
        );
        expect(url.pathname).toBe("/cli-login");
    });

    it("supports a local dashboard base URL", () => {
        const url = new URL(constructDashboardLoginUrl({ ...base, dashboardBaseUrl: "http://localhost:3000" }));
        expect(url.origin).toBe("http://localhost:3000");
        expect(url.pathname).toBe("/cli-login");
    });
});
