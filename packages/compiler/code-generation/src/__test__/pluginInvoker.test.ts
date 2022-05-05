import path from "path";
import { invokePlugin } from "../pluginInvoker";

const CONFIG_DIR = path.join(__dirname, "test-config");
const OUTPUT_DIR = path.join(__dirname, "test-output");

describe("invokeCodeGenPlugin", () => {
    it("invokeJavaClientGenerator", () => {
        invokePlugin("fern-java-client", "latest", CONFIG_DIR, OUTPUT_DIR);
    });
});
