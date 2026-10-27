import path from "node:path";
import type { ProtobufSpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { describe, expect, it } from "vitest";

import { resolveSdkConfigSourceRoot } from "../resolveSdkConfigSourceRoot.js";

const PROJECT = path.resolve("/work/project");
const CONFIG = path.join(PROJECT, "fern", "apis", "api", "sdk-config.yml");
const OWNER_DIRECTORY = AbsoluteFilePath.of(path.join(PROJECT, "fern", "apis", "api"));

function protobufSpec(root: string, target: string | undefined, fromOpenAPI: boolean): ProtobufSpec {
    return {
        type: "protobuf",
        absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(root),
        absoluteFilepathToProtobufTarget: target != null ? AbsoluteFilePath.of(target) : undefined,
        absoluteFilepathToOverrides: undefined,
        relativeFilepathToProtobufRoot: RelativeFilePath.of(path.basename(root)),
        generateLocally: false,
        fromOpenAPI,
        dependencies: []
    };
}

function owner(specs: ProtobufSpec[], absoluteFilePath = OWNER_DIRECTORY): OSSWorkspace {
    return new OSSWorkspace({
        specs: specs.filter((spec) => spec.fromOpenAPI),
        allSpecs: specs.filter((spec) => !spec.fromOpenAPI),
        generatorsConfiguration: undefined,
        workspaceName: "api",
        cliVersion: "0.0.0",
        absoluteFilePath
    });
}

describe("resolveSdkConfigSourceRoot", () => {
    it("is undefined without an owner", () => {
        expect(resolveSdkConfigSourceRoot(undefined, CONFIG)).toBeUndefined();
    });

    it("covers the owner's files", () => {
        const resolved = resolveSdkConfigSourceRoot(
            {
                absoluteFilePath: OWNER_DIRECTORY,
                workspaceName: "api",
                getAbsoluteFilePaths: () => [AbsoluteFilePath.of(path.join(PROJECT, "fern", "openapi.yml"))]
            },
            CONFIG
        );
        expect(resolved).toBe(path.join(PROJECT, "fern"));
    });

    it("covers the root of a from-openapi protobuf spec", () => {
        const resolved = resolveSdkConfigSourceRoot(
            owner([protobufSpec(path.join(PROJECT, "protos"), undefined, true)]),
            CONFIG
        );
        expect(resolved).toBe(PROJECT);
    });

    it("covers the root, not only the target, of a protobuf spec", () => {
        const root = path.join(PROJECT, "protos");
        const ownerDirectory = AbsoluteFilePath.of(path.join(root, "acme", "fern"));
        const resolved = resolveSdkConfigSourceRoot(
            owner([protobufSpec(root, path.join(root, "acme", "users.proto"), false)], ownerDirectory),
            path.join(ownerDirectory, "sdk-config.yml")
        );
        expect(resolved).toBe(root);
    });
});
