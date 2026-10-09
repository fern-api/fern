import type { generatorsYml } from "@fern-api/configuration-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it, vi } from "vitest";

import { warnOnUnsignedMavenPublishing } from "../warnOnUnsignedMavenPublishing.js";

const DEFAULT_URL = "https://ossrh-staging-api.central.sonatype.com/service/local/staging/deploy/maven2/";
const MESSAGE =
    "Maven output for fernapi/fern-java-sdk has no `signature` and no `url`. Maven Central requires signed artifacts, so this publish will be uploaded to the Central Portal staging service but never released. Add `signature` to publish to Maven Central, or set `url` to publish to another registry.";

const UNSIGNED_OUTPUT = { location: "maven", coordinate: "com.acme:acme-java" } as const;

const DIRECT_MAVEN = FernFiddle.OutputMode.publishV2(
    FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
        registryUrl: DEFAULT_URL,
        username: "",
        password: "",
        coordinate: "com.acme:acme-java",
        signature: undefined,
        downloadSnippets: undefined
    })
);

const GITHUB_MAVEN = FernFiddle.OutputMode.githubV2(
    FernFiddle.GithubOutputModeV2.pullRequest({
        owner: "acme",
        repo: "acme-java",
        publishInfo: FernFiddle.GithubPublishInfo.maven({
            registryUrl: DEFAULT_URL,
            coordinate: "com.acme:acme-java",
            credentials: undefined,
            signature: undefined
        })
    })
);

function makeGenerator(
    raw: generatorsYml.GeneratorInvocationSchema | undefined,
    outputMode: FernFiddle.OutputMode
): generatorsYml.GeneratorInvocation {
    return { name: "fernapi/fern-java-sdk", raw, outputMode } as unknown as generatorsYml.GeneratorInvocation;
}

function run({
    generator,
    publishes = true,
    useLocalDocker = false
}: {
    generator: generatorsYml.GeneratorInvocation;
    publishes?: boolean;
    useLocalDocker?: boolean;
}): string[] {
    const warn = vi.fn();
    warnOnUnsignedMavenPublishing({
        groups: [{ groupName: "java", generators: [generator] } as unknown as generatorsYml.GeneratorGroup],
        publishes,
        useLocalDocker,
        logger: { ...createMockTaskContext().logger, warn }
    });
    return warn.mock.calls.map((call) => call.join(" "));
}

describe("warnOnUnsignedMavenPublishing", () => {
    it("warns for a direct Maven publish without signature or url", () => {
        const generator = makeGenerator(
            { name: "fernapi/fern-java-sdk", version: "1.0.0", output: UNSIGNED_OUTPUT },
            DIRECT_MAVEN
        );
        expect(run({ generator })).toEqual([MESSAGE]);
    });

    it("warns for a GitHub-delivered Maven publish without signature or url, including --local", () => {
        const generator = makeGenerator(
            {
                name: "fernapi/fern-java-sdk",
                version: "1.0.0",
                output: UNSIGNED_OUTPUT,
                github: { repository: "acme/acme-java" }
            },
            GITHUB_MAVEN
        );
        expect(run({ generator })).toEqual([MESSAGE]);
        expect(run({ generator, useLocalDocker: true })).toEqual([MESSAGE]);
    });

    it("does not warn when a signature or url is configured", () => {
        const signed = makeGenerator(
            {
                name: "fernapi/fern-java-sdk",
                version: "1.0.0",
                output: { ...UNSIGNED_OUTPUT, signature: { keyId: "k", password: "p", secretKey: "s" } }
            },
            DIRECT_MAVEN
        );
        const customUrl = makeGenerator(
            {
                name: "fernapi/fern-java-sdk",
                version: "1.0.0",
                output: { ...UNSIGNED_OUTPUT, url: "https://maven.acme.com/releases" }
            },
            DIRECT_MAVEN
        );
        expect(run({ generator: signed })).toEqual([]);
        expect(run({ generator: customUrl })).toEqual([]);
    });

    it("does not warn when the run does not publish", () => {
        const direct = makeGenerator(
            { name: "fernapi/fern-java-sdk", version: "1.0.0", output: UNSIGNED_OUTPUT },
            DIRECT_MAVEN
        );
        // Previews and --dynamic-ir-only.
        expect(run({ generator: direct, publishes: false })).toEqual([]);
        // --local without a GitHub repository writes files instead of publishing.
        expect(run({ generator: direct, useLocalDocker: true })).toEqual([]);
        // --lfs-override rewrites the output mode to downloadFiles but keeps the raw schema.
        expect(run({ generator: makeGenerator(direct.raw, FernFiddle.OutputMode.downloadFiles({})) })).toEqual([]);
        // SDK Config and fern.yml targets carry no generators.yml schema.
        expect(run({ generator: makeGenerator(undefined, DIRECT_MAVEN) })).toEqual([]);
    });
});
