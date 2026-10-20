import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { type Project } from "@fern-api/project-loader";
import { describe, expect, it } from "vitest";

import { filterOssWorkspaces } from "../filterOssWorkspaces.js";

function ossWorkspace(workspaceName: string): OSSWorkspace {
    return new OSSWorkspace({
        specs: [],
        allSpecs: [],
        workspaceName,
        absoluteFilePath: AbsoluteFilePath.of("/repo/fern"),
        generatorsConfiguration: undefined,
        changelog: undefined,
        cliVersion: "0.0.0"
    });
}

function projectWith(apiWorkspaces: unknown[]): Project {
    // Only `apiWorkspaces` is read by filterOssWorkspaces.
    return { apiWorkspaces } as unknown as Project;
}

describe("filterOssWorkspaces", () => {
    it("returns [] for a project without api workspaces", async () => {
        expect(await filterOssWorkspaces(projectWith([]))).toEqual([]);
    });

    it("keeps OSSWorkspace instances, in order, and returns the same instances", async () => {
        const first = ossWorkspace("first");
        const second = ossWorkspace("second");
        const result = await filterOssWorkspaces(projectWith([first, second]));
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(first);
        expect(result[1]).toBe(second);
    });

    it("drops workspaces that are not OSSWorkspace instances", async () => {
        const oss = ossWorkspace("oss");
        const lookalike = { type: "oss", workspaceName: "lookalike", specs: [], allSpecs: [] };
        const fern = { type: "fern", workspaceName: "fern" };
        const result = await filterOssWorkspaces(projectWith([fern, oss, lookalike]));
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(oss);
    });

    it("returns [] when no workspace is an OSSWorkspace", async () => {
        expect(await filterOssWorkspaces(projectWith([{ type: "fern" }, { type: "oss" }]))).toEqual([]);
    });
});
