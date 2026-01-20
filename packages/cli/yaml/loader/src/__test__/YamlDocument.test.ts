import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { RelativeFilePath } from "@fern-api/path-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { YamlDocument } from "../YamlDocument";

const SAMPLE_YAML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

sdks:
  autorelease: true
  defaultGroup: public
  targets:
    node:
      - lang: typescript
        version: "1.4.0"
`;

const TEST_FILE_PATH = AbsoluteFilePath.of("/test/sample.yaml");
const TEST_RELATIVE_PATH = RelativeFilePath.of("sample.yaml");

describe("YamlDocument", () => {
    let yamlDoc: YamlDocument;

    beforeEach(() => {
        const document = parseDocument(SAMPLE_YAML);
        yamlDoc = new YamlDocument({
            absoluteFilePath: TEST_FILE_PATH,
            relativeFilePath: TEST_RELATIVE_PATH,
            document,
            source: SAMPLE_YAML
        });
    });

    it("returns correct source location for top-level values", () => {
        const editionLoc = yamlDoc.getSourceLocation(["edition"]);
        expect(editionLoc).toMatchObject({ line: 1, column: 10 });

        const orgLoc = yamlDoc.getSourceLocation(["org"]);
        expect(orgLoc).toMatchObject({ line: 2, column: 6 });

        const cliLoc = yamlDoc.getSourceLocation(["cli"]);
        expect(cliLoc).toMatchObject({ line: 5, column: 3 });
    });

    it("returns correct source location for nested values", () => {
        const versionLoc = yamlDoc.getSourceLocation(["cli", "version"]);
        expect(versionLoc).toMatchObject({ line: 5, column: 12 });

        const autoreleaseLoc = yamlDoc.getSourceLocation(["sdks", "autorelease"]);
        expect(autoreleaseLoc).toMatchObject({ line: 8, column: 16 });
    });

    it("returns correct source location for array elements", () => {
        const firstTargetLoc = yamlDoc.getSourceLocation(["sdks", "targets", "node", 0]);
        expect(firstTargetLoc).toMatchObject({ line: 12, column: 9 });

        const langLoc = yamlDoc.getSourceLocation(["sdks", "targets", "node", 0, "lang"]);
        expect(langLoc).toMatchObject({ line: 12, column: 15 });
    });

    it("returns root location for non-existent paths", () => {
        const rootLoc = yamlDoc.getRootSourceLocation();

        const nonexistentLoc = yamlDoc.getSourceLocation(["nonexistent"]);
        expect(nonexistentLoc.line).toBe(rootLoc.line);
        expect(nonexistentLoc.column).toBe(rootLoc.column);

        const invalidArrayIndexLoc = yamlDoc.getSourceLocation(["sdks", "targets", "node", 99]);
        expect(invalidArrayIndexLoc.line).toBe(rootLoc.line);
        expect(invalidArrayIndexLoc.column).toBe(rootLoc.column);
    });

    it("converts to plain JS object", () => {
        const js = yamlDoc.toJS();
        expect(js).toEqual({
            edition: "2026-01-01",
            org: "acme",
            cli: {
                version: "3.38.0"
            },
            sdks: {
                autorelease: true,
                defaultGroup: "public",
                targets: {
                    node: [
                        {
                            lang: "typescript",
                            version: "1.4.0"
                        }
                    ]
                }
            }
        });
    });
});
