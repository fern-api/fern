import path from "path";
import { invokePlugin } from "../pluginInvoker";

const CONFIG_DIR = path.join(__dirname, "test-config");
const OUTPUT_DIR = path.join(__dirname, "test-output");

describe("invokeCodeGenPlugin", () => {
    it("invokeJavaClientGenerator", async () => {
        await invokePlugin("fernapi/fern-java-client", "0.0.7", CONFIG_DIR, OUTPUT_DIR);
    }, 10_000);
});
