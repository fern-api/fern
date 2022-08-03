import { getUpgradeMessage } from "../upgradeNotifier";

describe("upgrade notifier test", () => {
    it("upgrade message", async () => {
        const upgradeMessage = await getUpgradeMessage("0.0.10");
        console.log(upgradeMessage);
        expect(upgradeMessage).toContain("Update available");
    });
});
