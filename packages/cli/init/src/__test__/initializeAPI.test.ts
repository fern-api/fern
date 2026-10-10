import type { TaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { initializeAPI } from "../initializeAPI.js";

describe("initializeAPI", () => {
    it("rejects Fern Definition initialization without exposing internal generation details", async () => {
        const failAndThrow = vi.fn((message: string | undefined) => {
            throw new Error(message);
        });
        const context = { failAndThrow } as unknown as TaskContext;
        await expect(
            initializeAPI({
                organization: "fern",
                versionOfCli: "0.0.0",
                openApiPath: undefined,
                useFernDefinition: true,
                useSdkConfig: true,
                includeDocs: false,
                context
            })
        ).rejects.toBeDefined();

        const message = failAndThrow.mock.calls[0]?.[0] ?? "";
        expect(message).toContain("fern init --openapi <path-or-url>");
        expect(message).not.toContain("FERN_USE_SDK_GEN_API");
        expect(message).not.toContain("SDK Gen API");
    });
});
