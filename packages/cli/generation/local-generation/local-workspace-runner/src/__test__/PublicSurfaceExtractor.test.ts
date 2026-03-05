import { describe, expect, it } from "vitest";
import { deriveLanguageFromGeneratorName, extractPublicSurface, truncateDiff } from "../PublicSurfaceExtractor.js";

describe("PublicSurfaceExtractor", () => {
    // ── TypeScript ──────────────────────────────────────────────────────

    it("preserves removed TypeScript export in surface diff", () => {
        const diff =
            "diff --git a/src/api/types.ts b/src/api/types.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/api/types.ts\n" +
            "+++ b/src/api/types.ts\n" +
            "@@ -1,5 +1,4 @@\n" +
            "-export function getUser(id: string): User {\n" +
            "-    return db.find(id);\n" +
            "-}\n" +
            " export function listUsers(): User[] {\n" +
            "     return db.findAll();\n" +
            " }\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result).toContain("export function getUser");
        expect(result).toContain("-export function getUser");
    });

    it("strips private TypeScript method body changes", () => {
        const diff =
            "diff --git a/src/client.ts b/src/client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/client.ts\n" +
            "+++ b/src/client.ts\n" +
            "@@ -10,7 +10,7 @@\n" +
            "     private doSomething(): void {\n" +
            "-        console.log('old');\n" +
            "+        console.log('new');\n" +
            "     }\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result.trim()).toBe("");
    });

    it("preserves added TypeScript interface field", () => {
        const diff =
            "diff --git a/src/api/types.ts b/src/api/types.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/api/types.ts\n" +
            "+++ b/src/api/types.ts\n" +
            "@@ -1,4 +1,5 @@\n" +
            " export interface User {\n" +
            "     name: string;\n" +
            "+    email: string;\n" +
            "     age: number;\n" +
            " }\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result).toContain("+    email: string;");
        expect(result).toContain("export interface User");
    });

    it("strips TypeScript import-only file sections", () => {
        const diff =
            "diff --git a/src/index.ts b/src/index.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/index.ts\n" +
            "+++ b/src/index.ts\n" +
            "@@ -1,3 +1,3 @@\n" +
            '-import { OldModule } from "./old";\n' +
            '+import { NewModule } from "./new";\n' +
            " // some code\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result.trim()).toBe("");
    });

    // ── Python ──────────────────────────────────────────────────────────

    it("preserves changed Python public function signature", () => {
        const diff =
            "diff --git a/src/client.py b/src/client.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/client.py\n" +
            "+++ b/src/client.py\n" +
            "@@ -5,7 +5,7 @@\n" +
            "-def get_user(id: str) -> User:\n" +
            "+def get_user(id: str, include_details: bool = False) -> User:\n" +
            "     pass\n";

        const result = extractPublicSurface(diff, "python");
        expect(result).toContain("-def get_user(id: str) -> User:");
        expect(result).toContain("+def get_user(id: str, include_details: bool = False) -> User:");
    });

    it("strips Python docstring-only changes", () => {
        const diff =
            "diff --git a/src/client.py b/src/client.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/client.py\n" +
            "+++ b/src/client.py\n" +
            "@@ -5,7 +5,7 @@\n" +
            '-    """Old docstring."""\n' +
            '+    """New docstring with more detail."""\n' +
            "     pass\n";

        const result = extractPublicSurface(diff, "python");
        expect(result.trim()).toBe("");
    });

    // ── Java ────────────────────────────────────────────────────────────

    it("preserves added Java public method declaration", () => {
        const diff =
            "diff --git a/src/main/java/com/example/Client.java b/src/main/java/com/example/Client.java\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/main/java/com/example/Client.java\n" +
            "+++ b/src/main/java/com/example/Client.java\n" +
            "@@ -10,6 +10,10 @@\n" +
            "     public User getUser(String id) {\n" +
            "         return db.find(id);\n" +
            "     }\n" +
            "+    public List<User> listUsers() {\n" +
            "+        return db.findAll();\n" +
            "+    }\n" +
            " }\n";

        const result = extractPublicSurface(diff, "java");
        expect(result).toContain("+    public List<User> listUsers()");
    });

    it("strips Java private field changes", () => {
        const diff =
            "diff --git a/src/main/java/com/example/Client.java b/src/main/java/com/example/Client.java\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/main/java/com/example/Client.java\n" +
            "+++ b/src/main/java/com/example/Client.java\n" +
            "@@ -5,7 +5,7 @@\n" +
            '-    private String oldField = "old";\n' +
            '+    private String oldField = "new";\n' +
            "     public String getName() {\n" +
            "         return oldField;\n" +
            "     }\n";

        const result = extractPublicSurface(diff, "java");
        // The private field change should be stripped; only public method kept
        expect(result).not.toContain("private String oldField");
    });

    // ── Go ──────────────────────────────────────────────────────────────

    it("preserves changed Go exported function signature", () => {
        const diff =
            "diff --git a/client.go b/client.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/client.go\n" +
            "+++ b/client.go\n" +
            "@@ -5,7 +5,7 @@\n" +
            "-func GetUser(id string) (*User, error) {\n" +
            "+func GetUser(id string, opts ...Option) (*User, error) {\n" +
            "     return nil, nil\n" +
            " }\n";

        const result = extractPublicSurface(diff, "go");
        expect(result).toContain("-func GetUser(id string) (*User, error)");
        expect(result).toContain("+func GetUser(id string, opts ...Option) (*User, error)");
    });

    it("strips Go unexported function changes", () => {
        const diff =
            "diff --git a/internal.go b/internal.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/internal.go\n" +
            "+++ b/internal.go\n" +
            "@@ -5,7 +5,7 @@\n" +
            "-func doInternal() {\n" +
            "+func doInternal(ctx context.Context) {\n" +
            "     // internal implementation\n" +
            " }\n";

        const result = extractPublicSurface(diff, "go");
        expect(result.trim()).toBe("");
    });

    // ── Cross-cutting ───────────────────────────────────────────────────

    it("returns empty string when no public surface changes detected", () => {
        const diff =
            "diff --git a/src/internal.ts b/src/internal.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/internal.ts\n" +
            "+++ b/src/internal.ts\n" +
            "@@ -1,5 +1,5 @@\n" +
            " // Internal helper\n" +
            "-    private helper(): void {\n" +
            "+    private helper(flag: boolean): void {\n" +
            "         // implementation\n" +
            "     }\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result.trim()).toBe("");
    });

    it("truncates surface diff when it exceeds 40KB", () => {
        // Build a diff that is larger than 40KB
        let largeDiff = "";
        for (let i = 0; i < 2000; i++) {
            largeDiff +=
                `diff --git a/src/types${i}.ts b/src/types${i}.ts\n` +
                "index abc123..def456 100644\n" +
                `--- a/src/types${i}.ts\n` +
                `+++ b/src/types${i}.ts\n` +
                "@@ -1,3 +1,4 @@\n" +
                ` export interface Type${i} {\n` +
                `+    newField${i}: string;\n` +
                "     existingField: number;\n" +
                " }\n";
        }

        expect(largeDiff.length).toBeGreaterThan(40 * 1024);

        const result = extractPublicSurface(largeDiff, "typescript");
        expect(result.length).toBeLessThanOrEqual(40 * 1024);
    });

    it("drops file sections with no surface changes", () => {
        const diff =
            // File 1: has public surface changes
            "diff --git a/src/api.ts b/src/api.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/api.ts\n" +
            "+++ b/src/api.ts\n" +
            "@@ -1,4 +1,5 @@\n" +
            " export interface Config {\n" +
            "     timeout: number;\n" +
            "+    retries: number;\n" +
            " }\n" +
            // File 2: only implementation changes (private)
            "diff --git a/src/internal.ts b/src/internal.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/internal.ts\n" +
            "+++ b/src/internal.ts\n" +
            "@@ -5,7 +5,7 @@\n" +
            "-    private cache = new Map();\n" +
            "+    private cache = new WeakMap();\n" +
            "     // internal\n";

        const result = extractPublicSurface(diff, "typescript");

        // File 1 should be preserved
        expect(result).toContain("src/api.ts");
        expect(result).toContain("+    retries: number;");

        // File 2 should be dropped (only private changes)
        expect(result).not.toContain("src/internal.ts");
    });

    // ── Additional edge cases ───────────────────────────────────────────

    it("handles empty diff input", () => {
        expect(extractPublicSurface("", "typescript")).toBe("");
        expect(extractPublicSurface("   \n  ", "typescript")).toBe("");
    });

    it("passes through diff for unknown languages", () => {
        const diff =
            "diff --git a/lib/foo.rb b/lib/foo.rb\n" +
            "index abc123..def456 100644\n" +
            "--- a/lib/foo.rb\n" +
            "+++ b/lib/foo.rb\n" +
            "@@ -1,3 +1,3 @@\n" +
            "-def old_method\n" +
            "+def new_method\n" +
            " end\n";

        const result = extractPublicSurface(diff, "ruby");
        // Unknown language should pass through
        expect(result).toContain("def new_method");
    });

    it("preserves TypeScript export const changes", () => {
        const diff =
            "diff --git a/src/constants.ts b/src/constants.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/constants.ts\n" +
            "+++ b/src/constants.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export const API_VERSION = '1.0';\n" +
            "+export const NEW_ENDPOINT = '/api/v2/users';\n" +
            " export const TIMEOUT = 5000;\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result).toContain("+export const NEW_ENDPOINT");
    });

    it("preserves TypeScript export type changes", () => {
        const diff =
            "diff --git a/src/types.ts b/src/types.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/types.ts\n" +
            "+++ b/src/types.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export type UserId = string;\n" +
            "+export type TeamId = string;\n" +
            " export type Config = { timeout: number };\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result).toContain("+export type TeamId = string;");
    });

    it("preserves Java annotation changes", () => {
        const diff =
            "diff --git a/src/main/java/Api.java b/src/main/java/Api.java\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/main/java/Api.java\n" +
            "+++ b/src/main/java/Api.java\n" +
            "@@ -5,6 +5,7 @@\n" +
            "+    @Deprecated\n" +
            "     public void oldMethod() {\n" +
            "         // impl\n" +
            "     }\n";

        const result = extractPublicSurface(diff, "java");
        expect(result).toContain("@Deprecated");
    });

    it("preserves Python class declarations", () => {
        const diff =
            "diff --git a/src/models.py b/src/models.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/models.py\n" +
            "+++ b/src/models.py\n" +
            "@@ -1,3 +1,6 @@\n" +
            " class User:\n" +
            "     name: str\n" +
            "+class Team:\n" +
            "+    id: str\n" +
            "+    name: str\n";

        const result = extractPublicSurface(diff, "python");
        expect(result).toContain("+class Team:");
        expect(result).toContain("+    id: str");
        expect(result).toContain("+    name: str");
    });

    it("preserves Go exported type declarations", () => {
        const diff =
            "diff --git a/types.go b/types.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/types.go\n" +
            "+++ b/types.go\n" +
            "@@ -1,3 +1,5 @@\n" +
            " type User struct {\n" +
            "     Name string\n" +
            " }\n" +
            "+type Team struct {\n" +
            "+    ID string\n" +
            "+}\n";

        const result = extractPublicSurface(diff, "go");
        expect(result).toContain("+type Team struct");
    });

    it("preserves TypeScript protected method changes", () => {
        const diff =
            "diff --git a/src/base.ts b/src/base.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/base.ts\n" +
            "+++ b/src/base.ts\n" +
            "@@ -5,7 +5,7 @@\n" +
            "-    protected doWork(): void {\n" +
            "+    protected doWork(options: Options): void {\n" +
            "         // implementation\n" +
            "     }\n";

        const result = extractPublicSurface(diff, "typescript");
        expect(result).toContain("-    protected doWork(): void");
        expect(result).toContain("+    protected doWork(options: Options): void");
    });
});

describe("truncateDiff", () => {
    it("returns diff unchanged when under 40KB", () => {
        const smallDiff = "diff --git a/file.ts b/file.ts\n+export const x = 1;";
        expect(truncateDiff(smallDiff)).toBe(smallDiff);
    });

    it("truncates diff exceeding 40KB", () => {
        const line = "x".repeat(100) + "\n";
        const largeDiff = line.repeat(500); // 50KB+
        expect(largeDiff.length).toBeGreaterThan(40 * 1024);

        const result = truncateDiff(largeDiff);
        expect(result.length).toBeLessThanOrEqual(40 * 1024);
    });
});

describe("deriveLanguageFromGeneratorName", () => {
    it("derives typescript from fernapi/fern-typescript-node-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-typescript-node-sdk")).toBe("typescript");
    });

    it("derives python from fernapi/fern-python-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-python-sdk")).toBe("python");
    });

    it("derives java from fernapi/fern-java-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-java-sdk")).toBe("java");
    });

    it("derives go from fernapi/fern-go-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-go-sdk")).toBe("go");
    });

    it("derives csharp from fernapi/fern-csharp-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-csharp-sdk")).toBe("csharp");
    });

    it("derives ruby from fernapi/fern-ruby-sdk", () => {
        expect(deriveLanguageFromGeneratorName("fernapi/fern-ruby-sdk")).toBe("ruby");
    });

    it("returns unknown for unrecognizable names", () => {
        expect(deriveLanguageFromGeneratorName("some-random-generator")).toBe("unknown");
    });
});
