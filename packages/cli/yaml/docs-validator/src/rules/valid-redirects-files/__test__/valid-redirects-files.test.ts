import { DocsConfigurationWithResolvedRedirects } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";

import { describe, expect, it } from "vitest";

import { RuleViolation } from "../../../Rule.js";
import { ValidRedirectsFilesRule } from "../valid-redirects-files.js";

async function getViolations(config: DocsConfigurationWithResolvedRedirects): Promise<RuleViolation[] | undefined> {
    const visitor = await ValidRedirectsFilesRule.create({
        workspace: {
            type: "docs",
            absoluteFilePath: AbsoluteFilePath.of("/fern"),
            config,
            workspaceName: undefined,
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/fern/docs.yml")
        },
        apiWorkspaces: [],
        ossWorkspaces: [],
        logger: NOOP_LOGGER
    });
    return await visitor.file?.({ config });
}

describe("valid-redirects-files", () => {
    it("reports no violations when no redirects files failed to load", async () => {
        expect(await getViolations({ instances: [], _redirectsFileErrors: [] })).toEqual([]);
        expect(await getViolations({ instances: [] })).toEqual([]);
    });

    it("reports every redirects file error as a fatal violation so that generation fails", async () => {
        const violations = await getViolations({
            instances: [],
            _redirectsFileErrors: [
                "Failed to parse /fern/redirects/a.yml: the file is empty and must contain a `redirects` list",
                "Failed to load redirects: /fern/redirects/b.yml does not exist"
            ]
        });

        expect(violations).toEqual([
            {
                severity: "fatal",
                message: "Failed to parse /fern/redirects/a.yml: the file is empty and must contain a `redirects` list"
            },
            {
                severity: "fatal",
                message: "Failed to load redirects: /fern/redirects/b.yml does not exist"
            }
        ]);
    });
});
