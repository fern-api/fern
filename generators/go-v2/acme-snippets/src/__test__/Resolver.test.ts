import { AuthValues } from "@fern-fern/ir-sdk/api/resources/dynamic";
import { Resolver } from "../Resolver";

describe("snippets", () => {
    it("POST /movies/create-movie", async () => {
        const resolver = new Resolver();
        const snippets = resolver.resolve({ language: "go" });
        const response = await snippets.generate({
            endpoint: {
                method: "POST",
                path: "/movies/create-movie"
            },
            auth: AuthValues.bearer({
                token: "<YOUR_API_KEY>"
            }),
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                title: "The Matrix",
                rating: 8.2
            }
        });
        // Include a \n prefix for easier readability.
        expect("\n" + response.snippet).toBe("TODO: Implement me!");
    });
});
