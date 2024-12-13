import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator";

describe("imdb", () => {
    it("success", async () => {
        const generator = new DynamicSnippetsGenerator({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ir: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            config: {} as any
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/movies/{movieId}"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            pathParameters: {
                movieId: "movie_xyz"
            },
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toMatchSnapshot();
    });
});
