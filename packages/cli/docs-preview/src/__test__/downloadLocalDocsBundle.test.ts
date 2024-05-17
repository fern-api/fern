import { downloadBundle } from "../downloadLocalDocsBundle";

describe("preview", () => {
    it("download frontend", async () => {
        await downloadBundle({ bucketUrl: "https://dev2-local-preview-bundle2.s3.amazonaws.com/" });

        expect(true).toEqual(true);
    }, 60_000);
});
