import { getLatestTag } from "../getLatestTag.js";

describe("getLatestTag", () => {
    it.skip("tag", async () => {
        const version = await getLatestTag("lodash/lodash");
        expect(version).toEqual("4.17.21");
    }, 10000); // override default timeout
});
