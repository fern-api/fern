import { getFernCliUpgradeMessage } from "../upgrade-utils/getFernCliUpgradeMessage";

describe("upgrade notifier test", () => {
    it("upgrade message", async () => {
        const upgradeMessage = await getFernCliUpgradeMessage({
            packageName: "fern-api",
            packageVersion: "0.0.10",
            cliName: "fern",
        });
        expect(upgradeMessage).toContain("Update available");
    });
});
