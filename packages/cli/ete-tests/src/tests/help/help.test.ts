import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";

describe("help", () => {
    it("no arguments", async () => {
        const { stderr, failed } = await runFernCli([], {
            cwd: (await tmp.dir()).path,
            reject: false
        });
        expect(stderr).toMatchSnapshot();
        expect(failed).toBe(true);
    }, 60_000);
});
