import { getPluginOutputConfig } from "../runPlugin";

describe("getPluginOutputConfig", () => {
    it("path relative to root", () => {
        const pluginOutputConfig = getPluginOutputConfig(
            "/path/to/root/fern.config.json",
            "/path/to/root/path/to/output"
        );
        expect(pluginOutputConfig.pathRelativeToRootOnHost).toEqual("path/to/output");
    });
    it("no path relative to root", () => {
        const pluginOutputConfig = getPluginOutputConfig(undefined, "/path/to/root/path/to/output");
        expect(pluginOutputConfig.pathRelativeToRootOnHost).toEqual(null);
    });
});
