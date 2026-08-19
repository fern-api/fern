import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import type { AsyncApiSpec } from "../../../../api/config/AsyncApiSpec.js";
import type { OpenApiSpec } from "../../../../api/config/OpenApiSpec.js";
import type { ProtobufSpec } from "../../../../api/config/ProtobufSpec.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { filterSpecs } from "../filterSpecs.js";

function makeWorkspace(apis: Workspace["apis"]): Workspace {
    return {
        apis,
        cliVersion: "0.0.0",
        org: "test"
    };
}

const openapiSpec: OpenApiSpec = {
    openapi: AbsoluteFilePath.of("/project/fern/openapi.yml")
};

const openapiSpecWithOverrides: OpenApiSpec = {
    openapi: AbsoluteFilePath.of("/project/fern/openapi.yml"),
    overrides: AbsoluteFilePath.of("/project/fern/overrides.yml")
};

const openapiSpecWithMultipleOverrides: OpenApiSpec = {
    openapi: AbsoluteFilePath.of("/project/fern/openapi.yml"),
    overrides: [
        AbsoluteFilePath.of("/project/fern/overrides-1.yml"),
        AbsoluteFilePath.of("/project/fern/overrides-2.yml")
    ]
};

const asyncapiSpec: AsyncApiSpec = {
    asyncapi: AbsoluteFilePath.of("/project/fern/asyncapi.yml"),
    overrides: AbsoluteFilePath.of("/project/fern/async-overrides.yml")
};

describe("filterSpecs", () => {
    it("returns OpenAPI specs from workspace", () => {
        const workspace = makeWorkspace({
            api: { specs: [openapiSpecWithOverrides] }
        });
        const result = filterSpecs(workspace, {});
        expect(result).toHaveLength(1);
        expect(result[0]?.apiName).toBe("api");
        expect(result[0]?.specFilePath).toBe("/project/fern/openapi.yml");
        expect(result[0]?.overrides).toEqual([AbsoluteFilePath.of("/project/fern/overrides.yml")]);
    });

    it("returns AsyncAPI specs from workspace", () => {
        const workspace = makeWorkspace({
            api: { specs: [asyncapiSpec] }
        });
        const result = filterSpecs(workspace, {});
        expect(result).toHaveLength(1);
        expect(result[0]?.specFilePath).toBe("/project/fern/asyncapi.yml");
    });

    it("skips non-OpenAPI/AsyncAPI specs", () => {
        const protoSpec: ProtobufSpec = {
            proto: {
                root: AbsoluteFilePath.of("/project/fern/proto"),
                target: AbsoluteFilePath.of("/project/fern/proto/service.proto")
            }
        };
        const workspace = makeWorkspace({
            api: { specs: [protoSpec] }
        });
        const result = filterSpecs(workspace, {});
        expect(result).toHaveLength(0);
    });

    it("filters by api name", () => {
        const workspace = makeWorkspace({
            users: { specs: [openapiSpec] },
            orders: { specs: [asyncapiSpec] }
        });
        const result = filterSpecs(workspace, { api: "users" });
        expect(result).toHaveLength(1);
        expect(result[0]?.apiName).toBe("users");
    });

    it("returns undefined overrides when spec has none", () => {
        const workspace = makeWorkspace({
            api: { specs: [openapiSpec] }
        });
        const result = filterSpecs(workspace, {});
        expect(result[0]?.overrides).toBeUndefined();
    });

    it("normalizes single override to array", () => {
        const workspace = makeWorkspace({
            api: { specs: [openapiSpecWithOverrides] }
        });
        const result = filterSpecs(workspace, {});
        expect(result[0]?.overrides).toEqual([AbsoluteFilePath.of("/project/fern/overrides.yml")]);
    });

    it("preserves array of overrides", () => {
        const workspace = makeWorkspace({
            api: { specs: [openapiSpecWithMultipleOverrides] }
        });
        const result = filterSpecs(workspace, {});
        expect(result[0]?.overrides).toEqual([
            AbsoluteFilePath.of("/project/fern/overrides-1.yml"),
            AbsoluteFilePath.of("/project/fern/overrides-2.yml")
        ]);
    });

    it("returns entries from multiple APIs", () => {
        const workspace = makeWorkspace({
            users: { specs: [openapiSpec] },
            orders: { specs: [asyncapiSpec] }
        });
        const result = filterSpecs(workspace, {});
        expect(result).toHaveLength(2);
    });

    it("returns empty array for empty workspace", () => {
        const workspace = makeWorkspace({});
        const result = filterSpecs(workspace, {});
        expect(result).toHaveLength(0);
    });
});
