import { afterEach, describe, expect, it, vi } from "vitest";

import { createVenusService } from "../venus.js";

function stubFetch(body: unknown): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn(
        async () => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function sentHeaders(fetchMock: ReturnType<typeof vi.fn>): Headers {
    const [input, init] = fetchMock.mock.calls[0] as [unknown, RequestInit | undefined];
    return new Headers(input instanceof Request ? input.headers : init?.headers);
}

describe("createVenusService", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sends the bearer token when one is given", async () => {
        const fetchMock = stubFetch([]);

        await createVenusService({
            environment: "http://venus.test",
            token: "my-token"
        }).organization.getOrgIdsFromToken();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(sentHeaders(fetchMock).get("authorization")).toBe("Bearer my-token");
    });

    it("sends no Authorization header when the token is omitted", async () => {
        const fetchMock = stubFetch({});

        await createVenusService({ environment: "http://venus.test", token: undefined }).guestSession.create({
            fingerprint: "abc"
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(sentHeaders(fetchMock).has("authorization")).toBe(false);
    });
});
