import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetLatestVersionOfCli, mockGetFernDirectory, mockLoadProjectConfig, mockRunTask } = vi.hoisted(() => {
    const mockGetLatestVersionOfCli = vi.fn().mockResolvedValue("0.99.0");
    const mockGetFernDirectory = vi.fn().mockResolvedValue(undefined);
    const mockLoadProjectConfig = vi.fn().mockResolvedValue({ version: "0.50.0" });
    const mockRunTask = vi.fn(async (fn: (context: unknown) => Promise<unknown>) => fn({}));
    return { mockGetLatestVersionOfCli, mockGetFernDirectory, mockLoadProjectConfig, mockRunTask };
});

vi.mock("@fern-api/configuration-loader", () => ({
    getFernDirectory: () => mockGetFernDirectory(),
    loadProjectConfig: (...args: unknown[]) => mockLoadProjectConfig(...args)
}));

vi.mock("../cli-context/upgrade-utils/getLatestVersionOfCli.js", () => ({
    getLatestVersionOfCli: (...args: unknown[]) => mockGetLatestVersionOfCli(...args)
}));

const CURRENT_VERSION = "0.40.0";

const mockInfo = vi.fn();

const mockCliContext = {
    environment: { packageVersion: CURRENT_VERSION },
    logger: { info: mockInfo },
    runTask: (fn: (context: unknown) => Promise<unknown>) => mockRunTask(fn)
};

async function getIntended(): Promise<string> {
    const { getIntendedVersionOfCli } = await import("../getIntendedVersionOfCli.js");
    return getIntendedVersionOfCli(mockCliContext as never);
}

beforeEach(() => {
    delete process.env.FERN_NO_VERSION_REDIRECTION;
    delete process.env.FERN_RESOLVE_VERSION;
    mockGetFernDirectory.mockResolvedValue(undefined);
    mockGetLatestVersionOfCli.mockResolvedValue("0.99.0");
    mockLoadProjectConfig.mockResolvedValue({ version: "0.50.0" });
    mockInfo.mockClear();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("FERN_NO_VERSION_REDIRECTION", () => {
    it("returns current binary version when set to 'true'", async () => {
        process.env.FERN_NO_VERSION_REDIRECTION = "true";
        expect(await getIntended()).toBe(CURRENT_VERSION);
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
        expect(mockGetFernDirectory).not.toHaveBeenCalled();
    });

    it("does not short-circuit when set to other values", async () => {
        process.env.FERN_NO_VERSION_REDIRECTION = "false";
        expect(await getIntended()).toBe("0.99.0"); // falls through to latest
    });
});

describe("FERN_RESOLVE_VERSION", () => {
    it("returns current binary version for 'inherit'", async () => {
        process.env.FERN_RESOLVE_VERSION = "inherit";
        expect(await getIntended()).toBe(CURRENT_VERSION);
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
    });

    it("resolves to latest for 'latest'", async () => {
        process.env.FERN_RESOLVE_VERSION = "latest";
        expect(await getIntended()).toBe("0.99.0");
        expect(mockGetLatestVersionOfCli).toHaveBeenCalledOnce();
    });

    it("returns the specific version as-is", async () => {
        process.env.FERN_RESOLVE_VERSION = "0.15.0";
        expect(await getIntended()).toBe("0.15.0");
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
        expect(mockGetFernDirectory).not.toHaveBeenCalled();
    });

    it("falls through to fern.config.json for 'auto'", async () => {
        process.env.FERN_RESOLVE_VERSION = "auto";
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        expect(await getIntended()).toBe("0.50.0");
    });

    it("falls through to fern.config.json when not set", async () => {
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        expect(await getIntended()).toBe("0.50.0");
    });

    it("falls through to fern.config.json for empty string", async () => {
        process.env.FERN_RESOLVE_VERSION = "";
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        expect(await getIntended()).toBe("0.50.0");
    });

    it("passes npm tags through as-is", async () => {
        process.env.FERN_RESOLVE_VERSION = "beta";
        expect(await getIntended()).toBe("beta");
        expect(mockGetFernDirectory).not.toHaveBeenCalled();
    });
});

describe("fern.config.json resolution", () => {
    it("returns latest when no fern directory exists", async () => {
        mockGetFernDirectory.mockResolvedValue(undefined);
        expect(await getIntended()).toBe("0.99.0");
        expect(mockGetLatestVersionOfCli).toHaveBeenCalledOnce();
    });

    it("returns current binary version for '*'", async () => {
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        mockLoadProjectConfig.mockResolvedValue({ version: "*" });
        expect(await getIntended()).toBe(CURRENT_VERSION);
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
    });

    it("resolves to latest for 'latest' in config", async () => {
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        mockLoadProjectConfig.mockResolvedValue({ version: "latest" });
        expect(await getIntended()).toBe("0.99.0");
        expect(mockGetLatestVersionOfCli).toHaveBeenCalledOnce();
    });

    it("returns pinned version from config", async () => {
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        mockLoadProjectConfig.mockResolvedValue({ version: "0.50.0" });
        expect(await getIntended()).toBe("0.50.0");
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
    });
});

describe("precedence", () => {
    it("FERN_NO_VERSION_REDIRECTION takes priority over FERN_RESOLVE_VERSION", async () => {
        process.env.FERN_NO_VERSION_REDIRECTION = "true";
        process.env.FERN_RESOLVE_VERSION = "0.15.0";
        expect(await getIntended()).toBe(CURRENT_VERSION);
    });

    it("FERN_RESOLVE_VERSION takes priority over fern.config.json", async () => {
        process.env.FERN_RESOLVE_VERSION = "0.15.0";
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        mockLoadProjectConfig.mockResolvedValue({ version: "0.50.0" });
        expect(await getIntended()).toBe("0.15.0");
        expect(mockGetFernDirectory).not.toHaveBeenCalled();
    });

    it("fern.config.json takes priority over latest fallback", async () => {
        mockGetFernDirectory.mockResolvedValue("/workspace/fern");
        mockLoadProjectConfig.mockResolvedValue({ version: "0.50.0" });
        expect(await getIntended()).toBe("0.50.0");
        expect(mockGetLatestVersionOfCli).not.toHaveBeenCalled();
    });
});
