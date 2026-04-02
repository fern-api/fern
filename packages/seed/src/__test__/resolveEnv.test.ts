import { resolveEnv } from "../commands/test/test-runner/resolveEnv.js";

describe("resolveEnv", () => {
    it("returns undefined when env is undefined", () => {
        expect(resolveEnv(undefined, "/repo")).toBeUndefined();
    });

    it("returns empty object when env is empty", () => {
        expect(resolveEnv({}, "/repo")).toEqual({});
    });

    it("substitutes {REPO_ROOT}", () => {
        expect(resolveEnv({ FOO: "{REPO_ROOT}/some/path" }, "/home/user/repo")).toEqual({
            FOO: "/home/user/repo/some/path"
        });
    });

    it("substitutes {PATH} with process.env.PATH", () => {
        const originalPath = process.env.PATH;
        process.env.PATH = "/usr/bin:/bin";
        try {
            expect(resolveEnv({ PATH: "/tools:{PATH}" }, "/repo")).toEqual({
                PATH: "/tools:/usr/bin:/bin"
            });
        } finally {
            process.env.PATH = originalPath;
        }
    });

    it("substitutes both {REPO_ROOT} and {PATH} in the same value", () => {
        const originalPath = process.env.PATH;
        process.env.PATH = "/usr/bin";
        try {
            expect(resolveEnv({ PATH: "{REPO_ROOT}/generators/csharp/.tools:{PATH}" }, "/repo")).toEqual({
                PATH: "/repo/generators/csharp/.tools:/usr/bin"
            });
        } finally {
            process.env.PATH = originalPath;
        }
    });

    it("substitutes all occurrences of {REPO_ROOT}", () => {
        expect(resolveEnv({ PATH: "{REPO_ROOT}/a:{REPO_ROOT}/b" }, "/repo")).toEqual({
            PATH: "/repo/a:/repo/b"
        });
    });

    it("passes through values with no placeholders unchanged", () => {
        expect(resolveEnv({ FOO: "bar", BAZ: "qux" }, "/repo")).toEqual({ FOO: "bar", BAZ: "qux" });
    });

    it("uses empty string when process.env.PATH is undefined", () => {
        const originalPath = process.env.PATH;
        delete process.env.PATH;
        try {
            expect(resolveEnv({ PATH: "/tools:{PATH}" }, "/repo")).toEqual({ PATH: "/tools:" });
        } finally {
            process.env.PATH = originalPath;
        }
    });
});
