import fetch from "node-fetch";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern mock", () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("mock request/response", async () => {
        void runFernCli(["mock", "--api", "simple", "--port", "3001"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple"))
        });

        await sleep(5000);

        const getResponse = await fetch("http://localhost:3001/test/root/movies/id-123?movieName=hello", {
            method: "GET"
        });

        expect(getResponse.body != null).toEqual(true);
        const getResponseBody = await getResponse.json();
        expect(typeof getResponseBody === "object").toEqual(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(Object.keys(getResponseBody as any)).toEqual(["id", "title", "rating"]);

        const postResponse = await fetch("http://localhost:3001/test/root/movies", {
            method: "POST",
            body: JSON.stringify({
                title: "Shrek",
                rating: 10
            }),
            headers: {
                "content-type": "application/json"
            }
        });

        expect(postResponse.body != null).toEqual(true);
        const postResponseBody = await postResponse.json();
        expect(postResponseBody).toEqual("shrek-123");
    }, 180_000);
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
