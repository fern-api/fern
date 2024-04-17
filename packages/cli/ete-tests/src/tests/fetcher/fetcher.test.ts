import { fetcher } from "@fern-typescript/fetcher";

describe("Fetcher Tests", () => {
    it("Test if making a request works", async () => {
        const response = await fetcher({
            url: "https://google.com",
            method: "GET"
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((response as any)?.error?.statusCode).toEqual(200);
    }, 90_000);
});
