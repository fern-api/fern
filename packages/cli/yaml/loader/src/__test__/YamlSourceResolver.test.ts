import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { RelativeFilePath } from "@fern-api/path-utils";
import type { Sourced } from "@fern-api/source";
import { beforeEach, describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { YamlDocument } from "../YamlDocument";
import { YamlSourceResolver } from "../YamlSourceResolver";

const TEST_FILE_PATH = AbsoluteFilePath.of("/test/sample.yaml");
const TEST_RELATIVE_PATH = RelativeFilePath.of("sample.yaml");
const TEST_YAML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

sdks:
  autorelease: true
  targets:
    node:
      lang: typescript
      version: "1.4.0"
`;

/**
 * Type definitions for the sample YAML structure.
 */
interface TestConfig {
    edition: string;
    org: string;
    cli: {
        version: string;
    };
    sdks: {
        autorelease: boolean;
        targets: {
            node: {
                lang: string;
                version: string;
            };
        };
    };
}

describe("YamlSourceResolver", () => {
    let sourced: Sourced<TestConfig>;

    beforeEach(() => {
        sourced = createSourcedConfig();
    });

    it("wraps primitive values with $loc and valueOf()", () => {
        expect(sourced.$loc).toBeDefined();
        expect(sourced.edition.$loc).toMatchObject({ line: 1, column: 10 });
        expect(sourced.edition + "").toBe("2026-01-01");
        expect(sourced.edition.value).toBe("2026-01-01");
        expect(String(sourced.edition)).toBe("2026-01-01");
        expect(sourced.org.$loc).toMatchObject({ line: 2, column: 6 });
        expect(sourced.org.value).toBe("acme");
    });

    it("provides $loc on objects via proxy", () => {
        expect(sourced.cli.$loc).toMatchObject({ line: 5, column: 3 });
        expect(sourced.cli.version.$loc).toMatchObject({ line: 5, column: 12 });
        expect(sourced.cli.version.value).toBe("3.38.0");
        expect(sourced.sdks.$loc).toMatchObject({ line: 8, column: 3 });
        expect(sourced.sdks.autorelease.$loc).toMatchObject({ line: 8, column: 16 });
        expect(sourced.sdks.autorelease.value).toBe(true);
    });

    it("provides $loc on nested objects", () => {
        const nodeConfig = sourced.sdks.targets.node;
        expect(nodeConfig.$loc).toMatchObject({ line: 11, column: 7 });
        expect(nodeConfig.lang.$loc).toMatchObject({ line: 11, column: 13 });
        expect(nodeConfig.lang.value).toBe("typescript");
        expect(nodeConfig.version.$loc).toMatchObject({ line: 12, column: 16 });
        expect(nodeConfig.version.value).toBe("1.4.0");
    });

    it("valueOf() allows primitives to work in expressions", () => {
        expect(sourced.edition + " test").toBe("2026-01-01 test");
        expect(sourced.sdks.autorelease ? "yes" : "no").toBe("yes");
    });
});

function createSourcedConfig(): Sourced<TestConfig> {
    const yamlDoc = new YamlDocument({
        absoluteFilePath: TEST_FILE_PATH,
        relativeFilePath: TEST_RELATIVE_PATH,
        source: TEST_YAML,
        document: parseDocument(TEST_YAML)
    });
    const value = yamlDoc.toJS() as TestConfig;
    return new YamlSourceResolver(yamlDoc).toSourced(value);
}
