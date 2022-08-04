import { getUpgradeMessage } from "../upgradeNotifier";

describe("upgrade notifier test", () => {
    it("upgrade message", async () => {
        const upgradeMessage = await getUpgradeMessage("0.0.10");
        expect(upgradeMessage).toContain("Update available");
    });
});
