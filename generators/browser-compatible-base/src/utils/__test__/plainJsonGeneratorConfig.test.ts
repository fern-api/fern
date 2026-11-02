import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { getPackageName } from "../getPackageName.js";
import { getSdkVersion } from "../getSdkVersion.js";

// The docs platform hands dynamic-snippet generators a `JSON.parse`d generator config,
// so the output mode union has no `_visit`. Build the configs via JSON to mirror that.
function plainJsonConfig(mode: unknown): FernGeneratorExec.GeneratorConfig {
    return JSON.parse(
        JSON.stringify({
            irFilepath: "/fern/ir.json",
            output: { mode, path: "/fern/output" },
            customConfig: {},
            workspaceName: "",
            organization: "",
            environment: { _type: "local" },
            dryRun: false,
            whitelabel: false,
            writeUnitTests: true,
            generateOauthClients: true,
            generatePaginatedClients: true
        })
    );
}

describe("plain JSON generator config", () => {
    it("getSdkVersion reads github and publish modes without _visit", () => {
        expect(getSdkVersion(plainJsonConfig({ type: "github", repoUrl: "", version: "1.2.3" }))).toBe("1.2.3");
        expect(getSdkVersion(plainJsonConfig({ type: "publish", version: "4.5.6" }))).toBe("4.5.6");
        expect(getSdkVersion(plainJsonConfig({ type: "downloadFiles" }))).toBeUndefined();
    });

    it("getPackageName reads publishInfo and publishTarget without _visit", () => {
        expect(
            getPackageName(
                plainJsonConfig({
                    type: "github",
                    repoUrl: "",
                    version: "1.2.3",
                    publishInfo: { type: "npm", registryUrl: "", packageName: "@acme/sdk" }
                })
            )
        ).toBe("@acme/sdk");
        expect(
            getPackageName(
                plainJsonConfig({
                    type: "publish",
                    version: "1.2.3",
                    publishTarget: { type: "maven", registryUrl: "", coordinate: "com.acme:sdk" }
                })
            )
        ).toBe("com.acme:sdk");
        expect(getPackageName(plainJsonConfig({ type: "github", repoUrl: "", version: "1.2.3" }))).toBeUndefined();
    });

    it("still works with SDK-constructed configs", () => {
        const config: FernGeneratorExec.GeneratorConfig = {
            ...plainJsonConfig({ type: "downloadFiles" }),
            output: {
                path: "/fern/output",
                mode: FernGeneratorExec.OutputMode.github({ repoUrl: "", version: "7.8.9" })
            }
        };
        expect(getSdkVersion(config)).toBe("7.8.9");
    });
});
