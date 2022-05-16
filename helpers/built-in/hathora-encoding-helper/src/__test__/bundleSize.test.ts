import { lstat } from "fs/promises";
import path from "path";

const MAX_BUNDLE_SIZE = 50_000; // 50kb

it("bundle size", async () => {
    const stats = await lstat(path.join(__dirname, "../../dist/bundle.js"));
    expect(stats.size).toBeLessThanOrEqual(MAX_BUNDLE_SIZE);
});
