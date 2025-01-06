import { CONSOLE_LOGGER } from "@fern-api/logger";

import { downloadBundle } from "../downloadLocalDocsBundle";

describe("preview", () => {
    it("download frontend", async () => {
        await downloadBundle({
            bucketUrl: "https://dev2-local-preview-bundle2.s3.amazonaws.com/",
            logger: CONSOLE_LOGGER,
            preferCached: false
        });

        expect(true).toEqual(true);
    }, 60_000);
});
