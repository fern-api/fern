import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { buildCheckJsonResult } from "../buildCheckJsonResult.js";
import { checkNodeVersion, MAX_SUPPORTED_NODE_MAJOR, MIN_SUPPORTED_NODE_MAJOR } from "../checkNodeVersion.js";
import { printCheckReport } from "../printCheckReport.js";

describe("checkNodeVersion", () => {
    it.each(["20.0.0", "20.19.5", "22.23.1", "24.11.0"])("accepts Node.js %s", (version) => {
        expect(checkNodeVersion(version).violations).toEqual([]);
    });

    it.each(["16.20.2", "18.20.8", "19.9.0"])("rejects Node.js %s as below the minimum", (version) => {
        const { violations } = checkNodeVersion(version);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.name).toBe("supported-node-version");
        expect(violations[0]?.message).toContain(`Node.js v${version} is not supported`);
        expect(violations[0]?.message).toContain(`${MIN_SUPPORTED_NODE_MAJOR}.x-${MAX_SUPPORTED_NODE_MAJOR}.x`);
    });

    it.each(["25.0.0", "26.1.0"])("rejects Node.js %s as above the maximum", (version) => {
        const { violations } = checkNodeVersion(version);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain(`Node.js v${version} has not been verified`);
    });

    it.each(["unknown", "20abc.1.0", ""])("rejects the unparseable version %j", (version) => {
        const { violations } = checkNodeVersion(version);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain(`Could not determine the Node.js version (got "${version}")`);
    });

    it("defaults to the running Node.js version", () => {
        expect(checkNodeVersion()).toEqual(checkNodeVersion(process.versions.node));
    });
});

describe("fern check report with system results", () => {
    it("fails the report on an unsupported Node.js version even without API or docs violations", () => {
        const context = createMockTaskContext();
        const { hasErrors } = printCheckReport({
            systemResult: checkNodeVersion("26.1.0"),
            apiResults: [],
            docsResult: undefined,
            logWarnings: false,
            context
        });
        expect(hasErrors).toBe(true);
    });

    it("passes the report on a supported Node.js version", () => {
        const context = createMockTaskContext();
        const { hasErrors } = printCheckReport({
            systemResult: checkNodeVersion("24.11.0"),
            apiResults: [],
            docsResult: undefined,
            logWarnings: false,
            context
        });
        expect(hasErrors).toBe(false);
    });

    it("includes system violations in the JSON output", () => {
        const result = buildCheckJsonResult({
            systemResult: checkNodeVersion("18.20.8"),
            apiResults: [],
            docsResult: undefined,
            hasErrors: true,
            showApiNames: false
        });
        expect(result.success).toBe(false);
        expect(result.results.system).toEqual([
            expect.objectContaining({ severity: "error", rule: "supported-node-version" })
        ]);
        expect(result.results.apis).toBeUndefined();
    });
});
