import { describe, expect, it, vi } from "vitest";

vi.mock("@fern-api/configuration", () => ({
    FERNIGNORE_FILENAME: ".fernignore",
    generatorsYml: {}
}));

const mockDoesPathExist = vi.fn<(path: string) => Promise<boolean>>();

vi.mock("@fern-api/fs-utils", () => ({
    doesPathExist: (...args: unknown[]) => mockDoesPathExist(args[0] as string),
    join: (...segments: string[]) => segments.join("/"),
    RelativeFilePath: {
        of: (p: string) => p
    }
}));

import { resolveAutoDiscoveredFernignorePath } from "../resolveAutoDiscoveredFernignorePath.js";

function createMockContext() {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            log: vi.fn(),
            trace: vi.fn(),
            disable: vi.fn(),
            enable: vi.fn()
        }
    };
}

describe("resolveAutoDiscoveredFernignorePath", () => {
    it("should return undefined when generator has no absolutePathToLocalOutput", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: mock generator invocation for testing
        const generatorInvocation = { absolutePathToLocalOutput: undefined } as any;
        // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
        const context = createMockContext() as any;

        const result = await resolveAutoDiscoveredFernignorePath({ generatorInvocation, context });

        expect(result).toBeUndefined();
        expect(mockDoesPathExist).not.toHaveBeenCalled();
    });

    it("should return undefined when generator has null absolutePathToLocalOutput", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: mock generator invocation for testing
        const generatorInvocation = { absolutePathToLocalOutput: null } as any;
        // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
        const context = createMockContext() as any;

        const result = await resolveAutoDiscoveredFernignorePath({ generatorInvocation, context });

        expect(result).toBeUndefined();
        expect(mockDoesPathExist).not.toHaveBeenCalled();
    });

    it("should return the .fernignore path when it exists in the output directory", async () => {
        mockDoesPathExist.mockResolvedValue(true);

        // biome-ignore lint/suspicious/noExplicitAny: mock generator invocation for testing
        const generatorInvocation = { absolutePathToLocalOutput: "/path/to/output" } as any;
        // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
        const context = createMockContext() as any;

        const result = await resolveAutoDiscoveredFernignorePath({ generatorInvocation, context });

        expect(result).toBe("/path/to/output/.fernignore");
        expect(mockDoesPathExist).toHaveBeenCalledWith("/path/to/output/.fernignore");
        expect(context.logger.debug).toHaveBeenCalledWith(expect.stringContaining("Auto-discovered .fernignore"));
    });

    it("should return undefined when .fernignore does not exist in the output directory", async () => {
        mockDoesPathExist.mockResolvedValue(false);

        // biome-ignore lint/suspicious/noExplicitAny: mock generator invocation for testing
        const generatorInvocation = { absolutePathToLocalOutput: "/path/to/output" } as any;
        // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
        const context = createMockContext() as any;

        const result = await resolveAutoDiscoveredFernignorePath({ generatorInvocation, context });

        expect(result).toBeUndefined();
        expect(mockDoesPathExist).toHaveBeenCalledWith("/path/to/output/.fernignore");
        expect(context.logger.debug).not.toHaveBeenCalled();
    });

    it("should check the correct path by joining output directory with .fernignore filename", async () => {
        mockDoesPathExist.mockResolvedValue(true);

        // biome-ignore lint/suspicious/noExplicitAny: mock generator invocation for testing
        const generatorInvocation = { absolutePathToLocalOutput: "/some/other/directory" } as any;
        // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
        const context = createMockContext() as any;

        await resolveAutoDiscoveredFernignorePath({ generatorInvocation, context });

        expect(mockDoesPathExist).toHaveBeenCalledWith("/some/other/directory/.fernignore");
    });
});
