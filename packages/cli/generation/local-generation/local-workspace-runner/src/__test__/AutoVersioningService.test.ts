import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { AutoVersioningException, AutoVersioningService } from "../AutoVersioningService.js";

// Mock logger for tests
const mockLogger = {
    info: () => {
        // No-op for tests
    },
    warn: () => {
        // No-op for tests
    },
    error: () => {
        // No-op for tests
    },
    debug: () => {
        // No-op for tests
    },
    disable: () => {
        // No-op for tests
    },
    enable: () => {
        // No-op for tests
    },
    trace: () => {
        // No-op for tests
    },
    log: () => {
        // No-op for tests
    }
};

// Helper function to run git commands in tests
async function runCommand(args: string[], cwd: string): Promise<void> {
    const command = args
        .map((arg) => (arg.includes(" ") || arg.includes("(") || arg.includes(")") ? `"${arg}"` : arg))
        .join(" ");
    execSync(command, { cwd, stdio: "pipe" });
}

describe("AutoVersioningService", () => {
    it("testExtractPreviousVersion_withSimpleVersion", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,7 +1,7 @@\n" +
            " {\n" +
            '   "name": "test-package",\n' +
            '-  "version": "1.2.3",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "description": "Test package"\n' +
            " }\n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("1.2.3");
    });

    it("testExtractPreviousVersion_withVPrefix", () => {
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/version.go\n" +
            "+++ b/version.go\n" +
            "@@ -1,3 +1,3 @@\n" +
            " package main\n" +
            '-const Version = "v2.5.1"\n' +
            '+const Version = "v505.503.4455"\n';

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "v505.503.4455"
        );
        expect(previousVersion).toBe("v2.5.1");
    });

    it("testExtractPreviousVersion_withPreRelease", () => {
        const diff =
            "diff --git a/setup.py b/setup.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/setup.py\n" +
            "+++ b/setup.py\n" +
            "@@ -5,7 +5,7 @@\n" +
            " setup(\n" +
            "     name='test-package',\n" +
            "-    version='3.0.0-beta.2',\n" +
            "+    version='505.503.4455',\n" +
            "     description='Test package'\n" +
            " )\n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("3.0.0-beta.2");
    });

    it("testExtractPreviousVersion_noPreviousVersion_returnsUndefined", () => {
        const diff =
            "diff --git a/new-file.txt b/new-file.txt\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/new-file.txt\n" +
            "@@ -0,0 +1 @@\n" +
            "+version = 505.503.4455\n";

        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455");
        expect(result).toBeUndefined();
    });

    it("testExtractPreviousVersion_newRepoWithMultipleNewFiles_returnsUndefined", () => {
        // Simulates a new SDK repo where all files are new (like immix-ts-sdk initial generation)
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/package.json\n" +
            "@@ -0,0 +1,6 @@\n" +
            "+{\n" +
            '+    "name": "test-sdk",\n' +
            '+    "version": "505.503.4455",\n' +
            '+    "private": false\n' +
            "+}\n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..def456\n" +
            "--- /dev/null\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -0,0 +1,5 @@\n" +
            "+export class Client {\n" +
            '+    private readonly version = "505.503.4455";\n' +
            "+    constructor() {}\n" +
            "+}\n" +
            "diff --git a/src/core/index.ts b/src/core/index.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..789abc\n" +
            "--- /dev/null\n" +
            "+++ b/src/core/index.ts\n" +
            "@@ -0,0 +1,3 @@\n" +
            '+export const SDK_VERSION = "505.503.4455";\n' +
            '+export const SDK_NAME = "test-sdk";\n';

        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455");
        expect(result).toBeUndefined();
    });

    it("testCleanDiffForAI_removesMagicVersionLines", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,7 +1,7 @@\n" +
            " {\n" +
            '   "name": "test-package",\n' +
            '-  "version": "1.2.3",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "description": "Test package"\n' +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("1.2.3");
        expect(cleaned).not.toContain('"version"');
        expect(cleaned).not.toContain("package.json");
    });

    it("testCleanDiffForAI_preservesOtherLines", () => {
        const diff =
            "diff --git a/src/config.ts b/src/config.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/config.ts\n" +
            "+++ b/src/config.ts\n" +
            "@@ -1,5 +1,5 @@\n" +
            " // Config file\n" +
            '-const VERSION = "1.0.0";\n' +
            '+const VERSION = "505.503.4455";\n' +
            " \n" +
            " // Features\n" +
            "+export const NEW_FEATURE = true;\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).toContain("// Config file");
        expect(cleaned).toContain("// Features");
        expect(cleaned).toContain("NEW_FEATURE");
        expect(cleaned).not.toContain("505.503.4455");
    });

    it("testCleanDiffForAI_emptyDiff", () => {
        const diff = "";
        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");
        expect(cleaned).toBe("");
    });

    it("testCleanDiffForAI_multipleMagicVersionOccurrences", () => {
        const diff =
            "diff --git a/test.txt b/test.txt\n" +
            "index abc123..def456 100644\n" +
            "--- a/test.txt\n" +
            "+++ b/test.txt\n" +
            "@@ -1,5 +1,5 @@\n" +
            "-version1 = 1.0.0\n" +
            "+version1 = 505.503.4455\n" +
            "-version2 = 2.0.0\n" +
            "+version2 = 505.503.4455\n" +
            " unchanged line\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("1.0.0");
        expect(cleaned).not.toContain("2.0.0");
        expect(cleaned).not.toContain("test.txt");
    });

    it("testExtractPreviousVersion_withMappedGoVersion", () => {
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/version.go\n" +
            "+++ b/version.go\n" +
            "@@ -1,3 +1,3 @@\n" +
            " package sdk\n" +
            '-const Version = "v1.5.2"\n' +
            '+const Version = "v505.503.4455"\n';

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "v505.503.4455"
        );
        expect(previousVersion).toBe("v1.5.2");
    });

    it("testCleanDiffForAI_withMappedGoVersion", () => {
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/version.go\n" +
            "+++ b/version.go\n" +
            "@@ -1,3 +1,3 @@\n" +
            " package sdk\n" +
            '-const Version = "v1.5.2"\n' +
            '+const Version = "v505.503.4455"\n' +
            " // Some other code\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "v505.503.4455");

        expect(cleaned).not.toContain("v505.503.4455");
        expect(cleaned).not.toContain("v1.5.2");
        expect(cleaned).not.toContain("version.go");
    });

    it("testExtractPreviousVersion_invalidVersionFormat_returnsUndefined", () => {
        const diff =
            "diff --git a/config.txt b/config.txt\n" +
            "index abc123..def456 100644\n" +
            "--- a/config.txt\n" +
            "+++ b/config.txt\n" +
            "@@ -1,3 +1,3 @@\n" +
            "-some random text\n" +
            "+magic version is 505.503.4455\n";

        // The minus line doesn't form a version pair, so no previous version can be extracted.
        // This is treated like a new file scenario - returns undefined instead of throwing.
        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455");
        expect(result).toBeUndefined();
    });

    it("testExtractPreviousVersion_withNonVersionLinesInBetween", () => {
        const diff =
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,5 +1,5 @@\n" +
            "-# sentra-unified-ts-sdk\n" +
            " \n" +
            '-version = "1.2.3"\n' +
            '+version = "505.503.4455"\n' +
            " \n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("1.2.3");
    });

    it("testExtractPreviousVersion_firstOccurrenceNoMatch_secondOccurrenceMatches", () => {
        const diff =
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # My Project\n" +
            "+Version: 505.503.4455\n" +
            " \n" +
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,5 +1,5 @@\n" +
            " {\n" +
            '-  "version": "1.5.0",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "name": "test"\n' +
            " }\n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("1.5.0");
    });

    it("testExtractPreviousVersion_noMatchingMinusLines_returnsUndefined", () => {
        const diff =
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,2 +1,3 @@\n" +
            " # My Project\n" +
            "+Version: 505.503.4455\n" +
            "diff --git a/CHANGELOG.md b/CHANGELOG.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/CHANGELOG.md\n" +
            "+++ b/CHANGELOG.md\n" +
            "@@ -1,2 +1,3 @@\n" +
            " # Changelog\n" +
            "+## 505.503.4455\n";

        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455");
        expect(result).toBeUndefined();
    });

    it("testCleanDiffForAI_removesFileWithOnlyVersionChanges", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index 4f83b37..a50bd11 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,6 +1,6 @@\n" +
            " {\n" +
            '     "name": "",\n' +
            '-    "version": "0.0.60441",\n' +
            '+    "version": "505.503.4455",\n' +
            '     "private": false\n' +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("package.json");
        expect(cleaned).not.toContain("0.0.60441");
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("diff --git");
    });

    it("testCleanDiffForAI_preservesFileWithUnrelatedChanges", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index 4f83b37..a50bd11 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,7 +1,8 @@\n" +
            " {\n" +
            '     "name": "test-package",\n' +
            '-    "version": "0.0.60441",\n' +
            '+    "version": "505.503.4455",\n' +
            '     "private": false,\n' +
            '+    "newField": "newValue",\n' +
            '     "description": "Test"\n' +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).toContain("package.json");
        expect(cleaned).toContain('+    "newField": "newValue"');
        expect(cleaned).not.toContain("0.0.60441");
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain('"version"');
    });

    it("testCleanDiffForAI_multipleFilesWithVersionChanges", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index 4f83b37..a50bd11 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,6 +1,6 @@\n" +
            " {\n" +
            '     "name": "",\n' +
            '-    "version": "0.0.60441",\n' +
            '+    "version": "505.503.4455",\n' +
            '     "private": false\n' +
            " }\n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index c4107fc..6887b07 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -24,7 +24,7 @@\n" +
            "                 {\n" +
            '                     "X-Fern-Language": "JavaScript",\n' +
            '                     "X-Fern-SDK-Name": "",\n' +
            '-                    "X-Fern-SDK-Version": "0.0.60441",\n' +
            '+                    "X-Fern-SDK-Version": "505.503.4455",\n' +
            '                     "X-Fern-Runtime": core.RUNTIME.type,\n' +
            "                 },\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("package.json");
        expect(cleaned).not.toContain("Client.ts");
        expect(cleaned).not.toContain("0.0.60441");
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("diff --git");
    });

    it("testCleanDiffForAI_multipleFilesWithMixedChanges", () => {
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index 4f83b37..a50bd11 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,6 +1,6 @@\n" +
            " {\n" +
            '     "name": "",\n' +
            '-    "version": "0.0.60441",\n' +
            '+    "version": "505.503.4455",\n' +
            '     "private": false\n' +
            " }\n" +
            "diff --git a/src/types.ts b/src/types.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/types.ts\n" +
            "+++ b/src/types.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " // Types\n" +
            " \n" +
            "+export type NewType = string;\n" +
            " // End\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("package.json");
        expect(cleaned).toContain("types.ts");
        expect(cleaned).toContain("+export type NewType = string;");
        expect(cleaned).not.toContain("0.0.60441");
        expect(cleaned).not.toContain("505.503.4455");
    });

    it("testCleanDiffForAI_versionInSdkHeader", () => {
        const diff =
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index c4107fc..6887b07 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -24,7 +24,7 @@\n" +
            "                 {\n" +
            '                     "X-Fern-Language": "JavaScript",\n' +
            '                     "X-Fern-SDK-Name": "",\n' +
            '-                    "X-Fern-SDK-Version": "0.0.60441",\n' +
            '+                    "X-Fern-SDK-Version": "505.503.4455",\n' +
            '                     "X-Fern-Runtime": core.RUNTIME.type,\n' +
            '                     "X-Fern-Runtime-Version": core.RUNTIME.version,\n' +
            "                 },\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("Client.ts");
        expect(cleaned).not.toContain("X-Fern-SDK-Version");
        expect(cleaned).not.toContain("0.0.60441");
        expect(cleaned).not.toContain("505.503.4455");
    });

    it("testCleanDiffForAI_versionFileWithOnlyVersionChange", () => {
        const diff =
            "diff --git a/src/version.ts b/src/version.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/version.ts\n" +
            "+++ b/src/version.ts\n" +
            "@@ -1,1 +1,1 @@\n" +
            '-export const VERSION = "1.2.3";\n' +
            '+export const VERSION = "505.503.4455";\n';

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("version.ts");
        expect(cleaned).not.toContain("1.2.3");
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("VERSION");
    });

    it("testCleanDiffForAI_versionInSdkHeaderWithContextLines", () => {
        const diff =
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index c4107fc..6887b07 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -24,7 +24,7 @@\n" +
            "                 {\n" +
            '                     "X-Fern-Language": "JavaScript",\n' +
            '                     "X-Fern-SDK-Name": "",\n' +
            '-                    "X-Fern-SDK-Version": "0.0.1",\n' +
            '                     "X-Fern-Runtime": core.RUNTIME.type,\n' +
            '+                    "X-Fern-SDK-Version": "505.503.4455",\n' +
            '                     "X-Fern-Runtime-Version": core.RUNTIME.version,\n' +
            "                 },\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("Client.ts");
        expect(cleaned).not.toContain("X-Fern-SDK-Version");
        expect(cleaned).not.toContain("0.0.1");
        expect(cleaned).not.toContain("505.503.4455");
    });

    it("testCleanDiffForAI_multipleVersionHeadersWithMagicVersion", () => {
        const diff =
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index c4107fc..6887b07 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -25,8 +25,8 @@\n" +
            "                 {\n" +
            '                     "X-Fern-Language": "JavaScript",\n' +
            '                     "X-Fern-SDK-Name": "",\n' +
            '-                    "X-Fern-SDK-Version": "0.0.1",\n' +
            '-                    "User-Agent": "/0.0.1",\n' +
            '+                    "X-Fern-SDK-Version": "505.503.4455",\n' +
            '+                    "User-Agent": "/505.503.4455",\n' +
            '                     "X-Fern-Runtime": core.RUNTIME.type,\n' +
            '                     "X-Fern-Runtime-Version": core.RUNTIME.version,\n' +
            "                 },\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("/505.503.4455");
    });

    it("testReplaceMagicVersion_simpleFile", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const testFile = path.join(tempDir, "package.json");
            const originalContent = '{\n  "version": "505.503.4455",\n  "name": "test-package"\n}';
            await fs.writeFile(testFile, originalContent);

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "1.2.3"
            );

            const updatedContent = await fs.readFile(testFile, "utf-8");
            expect(updatedContent).not.toContain("505.503.4455");
            expect(updatedContent).toContain("1.2.3");
            expect(updatedContent).toBe('{\n  "version": "1.2.3",\n  "name": "test-package"\n}');
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_withVPrefix", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const testFile = path.join(tempDir, "version.go");
            const originalContent = 'package main\n\nconst Version = "v505.503.4455"\n';
            await fs.writeFile(testFile, originalContent);

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "v505.503.4455",
                "v1.2.3"
            );

            const updatedContent = await fs.readFile(testFile, "utf-8");
            expect(updatedContent).not.toContain("v505.503.4455");
            expect(updatedContent).toContain("v1.2.3");
            expect(updatedContent).toBe('package main\n\nconst Version = "v1.2.3"\n');
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_multipleFiles", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const file1 = path.join(tempDir, "package.json");
            await fs.writeFile(file1, '{"version": "505.503.4455"}');

            const file2 = path.join(tempDir, "README.md");
            await fs.writeFile(file2, "# Version 505.503.4455\n\nThis is the magic version.");

            const file3 = path.join(tempDir, "setup.py");
            await fs.writeFile(file3, "version='505.503.4455'");

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "2.0.0"
            );

            const content1 = await fs.readFile(file1, "utf-8");
            const content2 = await fs.readFile(file2, "utf-8");
            const content3 = await fs.readFile(file3, "utf-8");

            expect(content1).not.toContain("505.503.4455");
            expect(content1).toContain("2.0.0");

            expect(content2).not.toContain("505.503.4455");
            expect(content2).toContain("2.0.0");

            expect(content3).not.toContain("505.503.4455");
            expect(content3).toContain("2.0.0");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_multipleOccurrences", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const testFile = path.join(tempDir, "config.yaml");
            const originalContent =
                "version: 505.503.4455\nmin_version: 505.503.4455\ndisplay_name: SDK v505.503.4455\n";
            await fs.writeFile(testFile, originalContent);

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "3.1.4"
            );

            const updatedContent = await fs.readFile(testFile, "utf-8");
            expect(updatedContent).not.toContain("505.503.4455");
            expect(updatedContent).toBe("version: 3.1.4\nmin_version: 3.1.4\ndisplay_name: SDK v3.1.4\n");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_nestedDirectories", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const subDir = path.join(tempDir, "src", "main", "java");
            await fs.mkdir(subDir, { recursive: true });

            const file1 = path.join(tempDir, "package.json");
            await fs.writeFile(file1, '{"version": "505.503.4455"}');

            const file2 = path.join(subDir, "Version.java");
            await fs.writeFile(file2, 'public static final String VERSION = "505.503.4455";');

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "4.5.6"
            );

            const content1 = await fs.readFile(file1, "utf-8");
            const content2 = await fs.readFile(file2, "utf-8");

            expect(content1).not.toContain("505.503.4455");
            expect(content1).toContain("4.5.6");

            expect(content2).not.toContain("505.503.4455");
            expect(content2).toContain("4.5.6");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_gitDirectoryIgnored", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const gitDir = path.join(tempDir, ".git");
            await fs.mkdir(gitDir, { recursive: true });

            const gitFile = path.join(gitDir, "config");
            await fs.writeFile(gitFile, "some_config=505.503.4455");

            const regularFile = path.join(tempDir, "version.txt");
            await fs.writeFile(regularFile, "version=505.503.4455");

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "1.0.0"
            );

            const gitContent = await fs.readFile(gitFile, "utf-8");
            const regularContent = await fs.readFile(regularFile, "utf-8");

            expect(gitContent).toContain("505.503.4455");
            expect(regularContent).not.toContain("505.503.4455");
            expect(regularContent).toContain("1.0.0");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_rubyFormat", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const gemspec = path.join(tempDir, "my-gem.gemspec");
            const originalContent =
                "Gem::Specification.new do |s|\n" +
                "  s.name = 'my-gem'\n" +
                "  s.version = 'v505.503.4455'\n" +
                "end\n";
            await fs.writeFile(gemspec, originalContent);

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "v505.503.4455",
                "v1.5.2"
            );

            const updatedContent = await fs.readFile(gemspec, "utf-8");
            expect(updatedContent).not.toContain("v505.503.4455");
            expect(updatedContent).toContain("v1.5.2");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_fileWithoutMagicVersion", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const testFile = path.join(tempDir, "README.md");
            const originalContent = "# My Project\n\nVersion: 1.0.0\n";
            await fs.writeFile(testFile, originalContent);

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "2.0.0"
            );

            const updatedContent = await fs.readFile(testFile, "utf-8");
            expect(updatedContent).toBe(originalContent);
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    // --- Tests for extractPreviousVersion: exception path ---

    it("testExtractPreviousVersion_noMagicVersionInDiff_throws", () => {
        // When the magic version is not found at all in the diff, it should throw
        const diff =
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # My Project\n" +
            "+Some new content\n" +
            " ## Installation\n";

        expect(() =>
            new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455")
        ).toThrow(AutoVersioningException);
    });

    it("testExtractPreviousVersion_emptyDiff_throws", () => {
        expect(() =>
            new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion("", "505.503.4455")
        ).toThrow(AutoVersioningException);
    });

    it("testExtractPreviousVersion_magicVersionOnlyInContextLines_throws", () => {
        // Magic version appears in context lines (no + or - prefix), should not count
        const diff =
            "diff --git a/config.txt b/config.txt\n" +
            "index abc123..def456 100644\n" +
            "--- a/config.txt\n" +
            "+++ b/config.txt\n" +
            "@@ -1,3 +1,4 @@\n" +
            " version = 505.503.4455\n" +
            "+new line added\n" +
            " other content\n";

        expect(() =>
            new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455")
        ).toThrow(AutoVersioningException);
    });

    // --- Tests for extractPreviousVersion: new repo with v prefix ---

    it("testExtractPreviousVersion_newRepoWithVPrefixMagicVersion_returnsUndefined", () => {
        // Go SDK new repo: all files are new, magic version has v prefix
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/version.go\n" +
            "@@ -0,0 +1,3 @@\n" +
            "+package sdk\n" +
            '+const Version = "v505.503.4455"\n' +
            "+\n" +
            "diff --git a/client.go b/client.go\n" +
            "new file mode 100644\n" +
            "index 0000000..def456\n" +
            "--- /dev/null\n" +
            "+++ b/client.go\n" +
            "@@ -0,0 +1,5 @@\n" +
            "+package sdk\n" +
            "+\n" +
            "+type Client struct {\n" +
            "+    version string // v505.503.4455\n" +
            "+}\n";

        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "v505.503.4455");
        expect(result).toBeUndefined();
    });

    it("testExtractPreviousVersion_singleNewFileWithVPrefix_returnsUndefined", () => {
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/version.go\n" +
            "@@ -0,0 +1 @@\n" +
            '+const Version = "v505.503.4455"\n';

        const result = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "v505.503.4455");
        expect(result).toBeUndefined();
    });

    // --- Tests for extractPreviousVersion: mixed scenario ---

    it("testExtractPreviousVersion_mixedNewAndExistingFiles_returnsVersionFromExisting", () => {
        // Some files are new (no matching minus lines), but one existing file has a version pair
        const diff =
            "diff --git a/src/newFile.ts b/src/newFile.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/src/newFile.ts\n" +
            "@@ -0,0 +1,3 @@\n" +
            '+export const SDK_VERSION = "505.503.4455";\n' +
            "+export const name = 'test';\n" +
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,5 +1,5 @@\n" +
            " {\n" +
            '-  "version": "2.3.4",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "name": "test"\n' +
            " }\n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("2.3.4");
    });

    it("testExtractPreviousVersion_mixedNewAndExistingFiles_newFileFirst_returnsVersionFromExisting", () => {
        // New file appears first in the diff, followed by existing file with version pair.
        // The new file's magic version occurrence should be skipped, then find match in existing file.
        const diff =
            "diff --git a/src/version.ts b/src/version.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/src/version.ts\n" +
            "@@ -0,0 +1,1 @@\n" +
            '+export const VERSION = "505.503.4455";\n' +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..def456\n" +
            "--- /dev/null\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -0,0 +1,2 @@\n" +
            '+import { VERSION } from "./version";\n' +
            '+const v = "505.503.4455";\n' +
            "diff --git a/package.json b/package.json\n" +
            "index 111111..222222 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -2,3 +2,3 @@\n" +
            '   "name": "my-sdk",\n' +
            '-  "version": "1.0.0",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "private": false\n';

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("1.0.0");
    });

    // --- Tests for cleanDiffForAI: new file scenarios ---

    it("testCleanDiffForAI_allNewFiles_removesAllVersionLines", () => {
        // Simulates a new SDK repo where all files are new (all + lines)
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/package.json\n" +
            "@@ -0,0 +1,5 @@\n" +
            "+{\n" +
            '+    "name": "test-sdk",\n' +
            '+    "version": "505.503.4455",\n' +
            '+    "private": false\n' +
            "+}\n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..def456\n" +
            "--- /dev/null\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -0,0 +1,3 @@\n" +
            "+export class Client {\n" +
            "+    constructor() {}\n" +
            "+}\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // The version line should be removed
        expect(cleaned).not.toContain("505.503.4455");
        // Other new file content should be preserved
        expect(cleaned).toContain('+    "name": "test-sdk"');
        expect(cleaned).toContain("+export class Client");
    });

    it("testCleanDiffForAI_newFileWithVPrefixMagicVersion", () => {
        // Go SDK new file scenario with v-prefixed magic version
        const diff =
            "diff --git a/version.go b/version.go\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/version.go\n" +
            "@@ -0,0 +1,3 @@\n" +
            "+package sdk\n" +
            '+const Version = "v505.503.4455"\n' +
            "+\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "v505.503.4455");

        expect(cleaned).not.toContain("v505.503.4455");
        expect(cleaned).toContain("+package sdk");
    });

    // --- Tests for replaceMagicVersion: initial version scenarios ---

    it("testReplaceMagicVersion_withVPrefixInitialVersion", async () => {
        // Simulates Go SDK initial generation: replacing v505.503.4455 with v0.0.1
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const versionFile = path.join(tempDir, "version.go");
            await fs.writeFile(versionFile, 'package sdk\n\nconst Version = "v505.503.4455"\n');

            const clientFile = path.join(tempDir, "client.go");
            await fs.writeFile(clientFile, 'package sdk\n\nvar sdkVersion = "v505.503.4455"\n');

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "v505.503.4455",
                "v0.0.1"
            );

            const versionContent = await fs.readFile(versionFile, "utf-8");
            expect(versionContent).not.toContain("v505.503.4455");
            expect(versionContent).toContain("v0.0.1");
            expect(versionContent).toBe('package sdk\n\nconst Version = "v0.0.1"\n');

            const clientContent = await fs.readFile(clientFile, "utf-8");
            expect(clientContent).not.toContain("v505.503.4455");
            expect(clientContent).toContain("v0.0.1");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testReplaceMagicVersion_withNonVPrefixInitialVersion", async () => {
        // Simulates TS/Python SDK initial generation: replacing 505.503.4455 with 0.0.1
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            const packageJson = path.join(tempDir, "package.json");
            await fs.writeFile(packageJson, '{\n  "name": "test-sdk",\n  "version": "505.503.4455"\n}');

            const clientFile = path.join(tempDir, "src");
            await fs.mkdir(clientFile, { recursive: true });
            const versionTs = path.join(clientFile, "version.ts");
            await fs.writeFile(versionTs, 'export const SDK_VERSION = "505.503.4455";\n');

            await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
                tempDir,
                "505.503.4455",
                "0.0.1"
            );

            const packageContent = await fs.readFile(packageJson, "utf-8");
            expect(packageContent).not.toContain("505.503.4455");
            expect(packageContent).toContain("0.0.1");
            expect(packageContent).toBe('{\n  "name": "test-sdk",\n  "version": "0.0.1"\n}');

            const versionContent = await fs.readFile(versionTs, "utf-8");
            expect(versionContent).not.toContain("505.503.4455");
            expect(versionContent).toContain("0.0.1");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    // --- Tests for extractPreviousVersion: edge cases ---

    it("testExtractPreviousVersion_magicVersionInDeletedLine_throws", () => {
        // Magic version appears only in a deleted line (not added), should not count
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,5 +1,4 @@\n" +
            " {\n" +
            '-  "version": "505.503.4455",\n' +
            '   "name": "test"\n' +
            " }\n";

        expect(() =>
            new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(diff, "505.503.4455")
        ).toThrow(AutoVersioningException);
    });

    it("testExtractPreviousVersion_multipleExistingFilesWithVersions_returnsFirst", () => {
        // Multiple files with version pairs - should return the first match
        const diff =
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,5 +1,5 @@\n" +
            " {\n" +
            '-  "version": "3.2.1",\n' +
            '+  "version": "505.503.4455",\n' +
            '   "name": "test"\n' +
            " }\n" +
            "diff --git a/src/version.ts b/src/version.ts\n" +
            "index 111111..222222 100644\n" +
            "--- a/src/version.ts\n" +
            "+++ b/src/version.ts\n" +
            "@@ -1 +1 @@\n" +
            '-export const VERSION = "3.2.1";\n' +
            '+export const VERSION = "505.503.4455";\n';

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("3.2.1");
    });

    it("testExtractPreviousVersion_versionWithBuildMetadata", () => {
        const diff =
            "diff --git a/setup.py b/setup.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/setup.py\n" +
            "+++ b/setup.py\n" +
            "@@ -1,3 +1,3 @@\n" +
            " setup(\n" +
            "-    version='1.0.0+build.123',\n" +
            "+    version='505.503.4455',\n" +
            " )\n";

        const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
            diff,
            "505.503.4455"
        );
        expect(previousVersion).toBe("1.0.0+build.123");
    });

    // --- Tests for cleanDiffForAI: mixed new and existing files ---

    it("testCleanDiffForAI_mixedNewAndExistingFiles_preservesNonVersionContent", () => {
        const diff =
            "diff --git a/src/newFile.ts b/src/newFile.ts\n" +
            "new file mode 100644\n" +
            "index 0000000..abc123\n" +
            "--- /dev/null\n" +
            "+++ b/src/newFile.ts\n" +
            "@@ -0,0 +1,3 @@\n" +
            "+export function hello() {\n" +
            '+    return "505.503.4455";\n' +
            "+}\n" +
            "diff --git a/src/existing.ts b/src/existing.ts\n" +
            "index 111111..222222 100644\n" +
            "--- a/src/existing.ts\n" +
            "+++ b/src/existing.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class Existing {\n" +
            "+    newMethod() { return true; }\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // Version line removed from new file
        expect(cleaned).not.toContain("505.503.4455");
        // Non-version new file content preserved
        expect(cleaned).toContain("+export function hello()");
        // Existing file changes preserved
        expect(cleaned).toContain("+    newMethod() { return true; }");
    });

    it("testCleanDiffForAI_namespaceChangeWithVersionChanges", () => {
        // Simulates namespace change from marketdata to market_data with version changes
        const diff =
            "diff --git a/pyproject.toml b/pyproject.toml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pyproject.toml\n" +
            "+++ b/pyproject.toml\n" +
            "@@ -1,5 +1,5 @@\n" +
            " [tool.poetry]\n" +
            ' name = "immix-sdk"\n' +
            '-version = "0.0.46"\n' +
            '+version = "505.503.4455"\n' +
            ' description = ""\n' +
            "diff --git a/src/immix/version.py b/src/immix/version.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/immix/version.py\n" +
            "+++ b/src/immix/version.py\n" +
            "@@ -1 +1 @@\n" +
            '-__version__ = "0.0.46"\n' +
            '+__version__ = "505.503.4455"\n' +
            "diff --git a/src/immix/client.py b/src/immix/client.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/immix/client.py\n" +
            "+++ b/src/immix/client.py\n" +
            "@@ -1,5 +1,5 @@\n" +
            "-from .marketdata import MarketDataClient\n" +
            "+from .market_data import MarketDataClient\n" +
            " from .trading import TradingClient\n" +
            " \n" +
            " class ImmixClient:\n" +
            "diff --git a/src/immix/core/client_wrapper.py b/src/immix/core/client_wrapper.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/immix/core/client_wrapper.py\n" +
            "+++ b/src/immix/core/client_wrapper.py\n" +
            "@@ -5,7 +5,7 @@\n" +
            " class ClientWrapper:\n" +
            "     headers = {\n" +
            '-        "X-Fern-SDK-Version": "0.0.46",\n' +
            '+        "X-Fern-SDK-Version": "505.503.4455",\n' +
            "     }\n" +
            "diff --git a/src/immix/marketdata/__init__.py b/src/immix/marketdata/__init__.py\n" +
            "deleted file mode 100644\n" +
            "index abc123..0000000\n" +
            "--- a/src/immix/marketdata/__init__.py\n" +
            "+++ /dev/null\n" +
            "@@ -1,3 +0,0 @@\n" +
            "-from .market_data import MarketDataClient\n" +
            "-from . import types\n" +
            '-__all__ = ["MarketDataClient", "types"]\n' +
            "diff --git a/src/immix/market_data/__init__.py b/src/immix/market_data/__init__.py\n" +
            "new file mode 100644\n" +
            "index 0000000..def456\n" +
            "--- /dev/null\n" +
            "+++ b/src/immix/market_data/__init__.py\n" +
            "@@ -0,0 +1,3 @@\n" +
            "+from .market_data import MarketDataClient\n" +
            "+from . import types\n" +
            '+__all__ = ["MarketDataClient", "types"]\n';

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // Version-only changes should be removed
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("0.0.46");
        // Namespace changes should be preserved
        expect(cleaned).toContain("market_data");
        expect(cleaned).toContain("marketdata");
        // File sections with only version changes should be removed
        expect(cleaned).not.toContain("pyproject.toml");
        expect(cleaned).not.toContain("version.py");
        // File sections with namespace changes should be preserved
        expect(cleaned).toContain("client.py");
        // Cleaned diff should be non-empty since there are real namespace changes
        expect(cleaned.trim().length).toBeGreaterThan(0);
    });

    it("testCleanDiffForAI_versionOnlyChanges_returnsEmptyDiff", () => {
        // Simulates a diff where ALL changes are version-related (no namespace or other changes)
        // This is the scenario that was causing the bug: cleaned diff becomes empty
        const diff =
            "diff --git a/pyproject.toml b/pyproject.toml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pyproject.toml\n" +
            "+++ b/pyproject.toml\n" +
            "@@ -1,5 +1,5 @@\n" +
            " [tool.poetry]\n" +
            ' name = "immix-sdk"\n' +
            '-version = "0.0.46"\n' +
            '+version = "505.503.4455"\n' +
            ' description = ""\n' +
            "diff --git a/src/immix/version.py b/src/immix/version.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/immix/version.py\n" +
            "+++ b/src/immix/version.py\n" +
            "@@ -1 +1 @@\n" +
            '-__version__ = "0.0.46"\n' +
            '+__version__ = "505.503.4455"\n' +
            "diff --git a/src/immix/core/client_wrapper.py b/src/immix/core/client_wrapper.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/immix/core/client_wrapper.py\n" +
            "+++ b/src/immix/core/client_wrapper.py\n" +
            "@@ -5,7 +5,7 @@\n" +
            " class ClientWrapper:\n" +
            "     headers = {\n" +
            '-        "X-Fern-SDK-Version": "0.0.46",\n' +
            '+        "X-Fern-SDK-Version": "505.503.4455",\n' +
            "     }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // All changes are version-related, so the cleaned diff should be empty
        expect(cleaned.trim().length).toBe(0);
        // Original diff was non-empty
        expect(diff.trim().length).toBeGreaterThan(0);
    });

    // ==================== .fern/metadata.json Exclusion Tests ====================
    // These tests verify the git diff pathspec used by LocalTaskHandler.generateDiffFile()
    // to exclude .fern/metadata.json from the diff used for AUTO version analysis.

    it("testGenerateDiff_excludesFernMetadataJson", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            await runCommand(["git", "init"], tempDir);
            await runCommand(["git", "config", "user.name", "Test User"], tempDir);
            await runCommand(["git", "config", "user.email", "test@example.com"], tempDir);

            // Create initial files
            await fs.writeFile(path.join(tempDir, "package.json"), '{\n  "name": "test-sdk",\n  "version": "1.0.0"\n}');
            await fs.mkdir(path.join(tempDir, ".fern"), { recursive: true });
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.40.0"}');

            await runCommand(["git", "add", "."], tempDir);
            await runCommand(["git", "commit", "-m", "Initial commit"], tempDir);

            // Modify ONLY .fern/metadata.json (simulates a CLI version bump)
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.41.0"}');

            // Replicate LocalTaskHandler.generateDiffFile() behavior:
            // 1. git add -N . (intent-to-add for new files)
            // 2. git diff HEAD with :(exclude).fern/metadata.json
            await runCommand(["git", "add", "-N", "."], tempDir);
            const diffFile = path.join(tempDir, "test.patch");
            await runCommand(
                ["git", "diff", "HEAD", "--output", diffFile, "--", ".", ":(exclude).fern/metadata.json"],
                tempDir
            );
            const diffContent = await fs.readFile(diffFile, "utf-8");

            // Diff should be empty since only .fern/metadata.json changed
            expect(diffContent.trim()).toBe("");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testGenerateDiff_includesOtherChangesAlongsideFernMetadata", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            await runCommand(["git", "init"], tempDir);
            await runCommand(["git", "config", "user.name", "Test User"], tempDir);
            await runCommand(["git", "config", "user.email", "test@example.com"], tempDir);

            await fs.writeFile(path.join(tempDir, "package.json"), '{\n  "name": "test-sdk",\n  "version": "1.0.0"\n}');
            await fs.mkdir(path.join(tempDir, ".fern"), { recursive: true });
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.40.0"}');
            await fs.mkdir(path.join(tempDir, "src"), { recursive: true });
            await fs.writeFile(path.join(tempDir, "src", "Client.ts"), "export class Client {}");

            await runCommand(["git", "add", "."], tempDir);
            await runCommand(["git", "commit", "-m", "Initial commit"], tempDir);

            // Modify .fern/metadata.json AND a real SDK file
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.41.0"}');
            await fs.writeFile(path.join(tempDir, "src", "Client.ts"), "export class Client {\n  newMethod() {}\n}");

            await runCommand(["git", "add", "-N", "."], tempDir);
            const diffFile = path.join(tempDir, "test.patch");
            await runCommand(
                ["git", "diff", "HEAD", "--output", diffFile, "--", ".", ":(exclude).fern/metadata.json"],
                tempDir
            );
            const diffContent = await fs.readFile(diffFile, "utf-8");

            expect(diffContent.trim()).not.toBe("");
            expect(diffContent).toContain("Client.ts");
            expect(diffContent).toContain("newMethod");
            expect(diffContent).not.toContain("metadata.json");
            expect(diffContent).not.toContain("cliVersion");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    it("testGenerateDiff_includesOtherFernDirectoryFiles", async () => {
        const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
        try {
            await runCommand(["git", "init"], tempDir);
            await runCommand(["git", "config", "user.name", "Test User"], tempDir);
            await runCommand(["git", "config", "user.email", "test@example.com"], tempDir);

            await fs.mkdir(path.join(tempDir, ".fern"), { recursive: true });
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.40.0"}');
            await fs.writeFile(path.join(tempDir, ".fern", "replay.lock"), "lock-content-v1");

            await runCommand(["git", "add", "."], tempDir);
            await runCommand(["git", "commit", "-m", "Initial commit"], tempDir);

            // Modify both .fern/metadata.json and .fern/replay.lock
            await fs.writeFile(path.join(tempDir, ".fern", "metadata.json"), '{"cliVersion": "0.41.0"}');
            await fs.writeFile(path.join(tempDir, ".fern", "replay.lock"), "lock-content-v2");

            await runCommand(["git", "add", "-N", "."], tempDir);
            const diffFile = path.join(tempDir, "test.patch");
            await runCommand(
                ["git", "diff", "HEAD", "--output", diffFile, "--", ".", ":(exclude).fern/metadata.json"],
                tempDir
            );
            const diffContent = await fs.readFile(diffFile, "utf-8");

            expect(diffContent.trim()).not.toBe("");
            expect(diffContent).toContain("replay.lock");
            expect(diffContent).not.toContain("metadata.json");
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    // TODO(tjb9dc): Reenable these tests, need to have them reference the LocalTaskHandler's gitDiff function (or refactor)
    // it("testAutoVersioningWorkflow_endToEnd", async () => {
    //     const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
    //     try {
    //         await runCommand(["git", "init"], tempDir);
    //         await runCommand(["git", "config", "user.name", "Test User"], tempDir);
    //         await runCommand(["git", "config", "user.email", "test@example.com"], tempDir);

    //         const packageJson = path.join(tempDir, "package.json");
    //         const initialContent = '{\n  "name": "test-sdk",\n  "version": "1.0.0"\n}';
    //         await fs.writeFile(packageJson, initialContent);

    //         await runCommand(["git", "add", "package.json"], tempDir);
    //         await runCommand(["git", "commit", "-m", "Initial commit"], tempDir);

    //         const magicVersion = "505.503.4455";
    //         const contentWithMagic = `{\n  "name": "test-sdk",\n  "version": "${magicVersion}"\n}`;
    //         await fs.writeFile(packageJson, contentWithMagic);

    //         await runCommand(["git", "add", "."], tempDir);

    //         const diffFile = await new AutoVersioningService({ logger: mockLogger }).generateDiff(tempDir);
    //         const diffContent = await fs.readFile(diffFile, "utf-8");

    //         expect(diffContent).toContain("1.0.0");
    //         expect(diffContent).toContain(magicVersion);

    //         const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
    //             diffContent,
    //             magicVersion
    //         );
    //         expect(previousVersion).toBe("1.0.0");

    //         const cleanedDiff = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(
    //             diffContent,
    //             magicVersion
    //         );
    //         expect(cleanedDiff).not.toContain(magicVersion);
    //         expect(cleanedDiff).not.toContain("package.json");

    //         const newVersion = incrementVersion(previousVersion, VersionBump.PATCH);
    //         expect(newVersion).toBe("1.0.1");

    //         await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
    //             tempDir,
    //             magicVersion,
    //             newVersion
    //         );

    //         const finalContent = await fs.readFile(packageJson, "utf-8");
    //         expect(finalContent).not.toContain(magicVersion);
    //         expect(finalContent).toContain("1.0.1");
    //         expect(finalContent).toBe('{\n  "name": "test-sdk",\n  "version": "1.0.1"\n}');

    //         await fs.unlink(diffFile);
    //     } finally {
    //         await fs.rm(tempDir, { recursive: true, force: true });
    //     }
    // });

    // it("testAutoVersioningWorkflow_withVPrefix", async () => {
    //     const tempDir = await fs.mkdtemp(path.join(require("os").tmpdir(), "test-"));
    //     try {
    //         await runCommand(["git", "init"], tempDir);
    //         await runCommand(["git", "config", "user.name", "Test User"], tempDir);
    //         await runCommand(["git", "config", "user.email", "test@example.com"], tempDir);

    //         const versionFile = path.join(tempDir, "version.go");
    //         const initialContent = 'package sdk\n\nconst Version = "v2.3.1"\n';
    //         await fs.writeFile(versionFile, initialContent);

    //         await runCommand(["git", "add", "version.go"], tempDir);
    //         await runCommand(["git", "commit", "-m", "Initial commit"], tempDir);

    //         const mappedMagicVersion = "v505.503.4455";
    //         const contentWithMagic = `package sdk\n\nconst Version = "${mappedMagicVersion}"\n`;
    //         await fs.writeFile(versionFile, contentWithMagic);

    //         await runCommand(["git", "add", "."], tempDir);

    //         const diffFile = await new AutoVersioningService({ logger: mockLogger }).generateDiff(tempDir);
    //         const diffContent = await fs.readFile(diffFile, "utf-8");

    //         const previousVersion = new AutoVersioningService({ logger: mockLogger }).extractPreviousVersion(
    //             diffContent,
    //             mappedMagicVersion
    //         );
    //         expect(previousVersion).toBe("v2.3.1");

    //         const newVersion = incrementVersion(previousVersion, VersionBump.MINOR);
    //         expect(newVersion).toBe("v2.4.0");

    //         await new AutoVersioningService({ logger: mockLogger }).replaceMagicVersion(
    //             tempDir,
    //             mappedMagicVersion,
    //             newVersion
    //         );

    //         const finalContent = await fs.readFile(versionFile, "utf-8");
    //         expect(finalContent).not.toContain(mappedMagicVersion);
    //         expect(finalContent).toContain("v2.4.0");
    //         expect(finalContent).toBe('package sdk\n\nconst Version = "v2.4.0"\n');

    //         await fs.unlink(diffFile);
    //     } finally {
    //         await fs.rm(tempDir, { recursive: true, force: true });
    //     }
    // });

    // ==================== File Path Exclusion Tests ====================
    // These tests verify that cleanDiffForAI excludes entire file sections
    // whose paths match the exclusion patterns (lock files, test files,
    // generated docs, snapshots, CI config) before sending to AI analysis.

    it("testCleanDiffForAI_excludesReferenceMd", () => {
        const diff =
            "diff --git a/reference.md b/reference.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/reference.md\n" +
            "+++ b/reference.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # API Reference\n" +
            "+## New Endpoint\n" +
            "+POST /api/v1/users\n" +
            " \n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class Client {\n" +
            "+    newMethod() { return true; }\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // reference.md should be excluded entirely
        expect(cleaned).not.toContain("reference.md");
        expect(cleaned).not.toContain("API Reference");
        expect(cleaned).not.toContain("New Endpoint");
        // Source file changes should be preserved
        expect(cleaned).toContain("Client.ts");
        expect(cleaned).toContain("+    newMethod() { return true; }");
    });

    it("testCleanDiffForAI_excludesPnpmLockYaml", () => {
        const diff =
            "diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pnpm-lock.yaml\n" +
            "+++ b/pnpm-lock.yaml\n" +
            "@@ -1,5 +1,6 @@\n" +
            " lockfileVersion: 5.4\n" +
            "+  axios: 1.6.0\n" +
            " \n" +
            "diff --git a/src/index.ts b/src/index.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/index.ts\n" +
            "+++ b/src/index.ts\n" +
            "@@ -1,2 +1,3 @@\n" +
            " export { Client } from './Client';\n" +
            "+export { NewType } from './NewType';\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("pnpm-lock.yaml");
        expect(cleaned).not.toContain("axios");
        expect(cleaned).toContain("index.ts");
        expect(cleaned).toContain("+export { NewType }");
    });

    it("testCleanDiffForAI_excludesMultipleLockFiles", () => {
        const diff =
            "diff --git a/yarn.lock b/yarn.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/yarn.lock\n" +
            "+++ b/yarn.lock\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # yarn lockfile\n" +
            "+some-package@^1.0.0:\n" +
            " \n" +
            "diff --git a/poetry.lock b/poetry.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/poetry.lock\n" +
            "+++ b/poetry.lock\n" +
            "@@ -1,3 +1,4 @@\n" +
            " [[package]]\n" +
            '+name = "requests"\n' +
            " \n" +
            "diff --git a/Cargo.lock b/Cargo.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/Cargo.lock\n" +
            "+++ b/Cargo.lock\n" +
            "@@ -1,3 +1,4 @@\n" +
            " [[package]]\n" +
            '+name = "serde"\n' +
            " \n" +
            "diff --git a/go.sum b/go.sum\n" +
            "index abc123..def456 100644\n" +
            "--- a/go.sum\n" +
            "+++ b/go.sum\n" +
            "@@ -1,2 +1,3 @@\n" +
            " github.com/pkg/errors v0.9.1 h1:abc\n" +
            "+github.com/stretchr/testify v1.8.0 h1:def\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("yarn.lock");
        expect(cleaned).not.toContain("poetry.lock");
        expect(cleaned).not.toContain("Cargo.lock");
        expect(cleaned).not.toContain("go.sum");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesTestFiles", () => {
        const diff =
            "diff --git a/src/api.test.ts b/src/api.test.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/api.test.ts\n" +
            "+++ b/src/api.test.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " describe('API', () => {\n" +
            "+    it('should work', () => {});\n" +
            " });\n" +
            "diff --git a/src/client.ts b/src/client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/client.ts\n" +
            "+++ b/src/client.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class ApiClient {\n" +
            "+    newEndpoint() {}\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // Test files matched by extension should be excluded
        expect(cleaned).not.toContain("api.test.ts");
        // Source files should be preserved
        expect(cleaned).toContain("client.ts");
        expect(cleaned).toContain("+    newEndpoint() {}");
    });

    it("testCleanDiffForAI_preservesDomainNamedDirectories", () => {
        // Directories like tests/, test/, and wire/ should NOT be excluded because
        // a customer's API domain could use those names (e.g. a QA platform with a
        // "tests" resource, or a banking API with a "wire" transfer resource)
        const diff =
            "diff --git a/tests/integration/client.py b/tests/integration/client.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/tests/integration/client.py\n" +
            "+++ b/tests/integration/client.py\n" +
            "@@ -1,3 +1,4 @@\n" +
            " class TestClient:\n" +
            "+    def test_new_endpoint(self): pass\n" +
            " \n" +
            "diff --git a/src/test/client.ts b/src/test/client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/test/client.ts\n" +
            "+++ b/src/test/client.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class TestClient {\n" +
            "+    runTest() {}\n" +
            " }\n" +
            "diff --git a/wire/transfer/client.ts b/wire/transfer/client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/wire/transfer/client.ts\n" +
            "+++ b/wire/transfer/client.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class WireTransferClient {\n" +
            "+    initiateTransfer() {}\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // All three files should be preserved — they're domain source, not test infra
        expect(cleaned).toContain("tests/integration/client.py");
        expect(cleaned).toContain("src/test/client.ts");
        expect(cleaned).toContain("wire/transfer/client.ts");
        expect(cleaned).toContain("+    def test_new_endpoint(self): pass");
        expect(cleaned).toContain("+    runTest() {}");
        expect(cleaned).toContain("+    initiateTransfer() {}");
    });

    it("testCleanDiffForAI_excludesSnapshotFiles", () => {
        const diff =
            "diff --git a/__snapshots__/client.snap b/__snapshots__/client.snap\n" +
            "index abc123..def456 100644\n" +
            "--- a/__snapshots__/client.snap\n" +
            "+++ b/__snapshots__/client.snap\n" +
            "@@ -1,3 +1,4 @@\n" +
            " exports[`snapshot`] = `\n" +
            "+new snapshot content\n" +
            " `;\n" +
            "diff --git a/results.snap b/results.snap\n" +
            "index abc123..def456 100644\n" +
            "--- a/results.snap\n" +
            "+++ b/results.snap\n" +
            "@@ -1,2 +1,3 @@\n" +
            " snapshot data\n" +
            "+more data\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("__snapshots__");
        expect(cleaned).not.toContain(".snap");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesCIAndEditorConfig", () => {
        const diff =
            "diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml\n" +
            "index abc123..def456 100644\n" +
            "--- a/.github/workflows/ci.yml\n" +
            "+++ b/.github/workflows/ci.yml\n" +
            "@@ -1,3 +1,4 @@\n" +
            " name: CI\n" +
            "+  - uses: actions/checkout@v4\n" +
            " \n" +
            "diff --git a/.editorconfig b/.editorconfig\n" +
            "index abc123..def456 100644\n" +
            "--- a/.editorconfig\n" +
            "+++ b/.editorconfig\n" +
            "@@ -1,2 +1,3 @@\n" +
            " root = true\n" +
            "+indent_size = 4\n" +
            "diff --git a/.prettierrc.json b/.prettierrc.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/.prettierrc.json\n" +
            "+++ b/.prettierrc.json\n" +
            "@@ -1,2 +1,3 @@\n" +
            " {\n" +
            '+    "semi": false\n' +
            " }\n" +
            "diff --git a/biome.json b/biome.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/biome.json\n" +
            "+++ b/biome.json\n" +
            "@@ -1,2 +1,3 @@\n" +
            " {\n" +
            '+    "formatter": {}\n' +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain(".github");
        expect(cleaned).not.toContain(".editorconfig");
        expect(cleaned).not.toContain(".prettierrc");
        expect(cleaned).not.toContain("biome.json");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesLintingAndDevtoolConfig", () => {
        const diff =
            "diff --git a/.eslintrc.json b/.eslintrc.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/.eslintrc.json\n" +
            "+++ b/.eslintrc.json\n" +
            "@@ -1,2 +1,3 @@\n" +
            " {\n" +
            '+    "extends": ["plugin:@typescript-eslint/recommended"]\n' +
            " }\n" +
            "diff --git a/.rubocop.yml b/.rubocop.yml\n" +
            "index abc123..def456 100644\n" +
            "--- a/.rubocop.yml\n" +
            "+++ b/.rubocop.yml\n" +
            "@@ -1,2 +1,3 @@\n" +
            " AllCops:\n" +
            "+  TargetRubyVersion: 3.0\n" +
            "diff --git a/phpstan.neon b/phpstan.neon\n" +
            "index abc123..def456 100644\n" +
            "--- a/phpstan.neon\n" +
            "+++ b/phpstan.neon\n" +
            "@@ -1,2 +1,3 @@\n" +
            " parameters:\n" +
            "+    level: 8\n" +
            "diff --git a/rustfmt.toml b/rustfmt.toml\n" +
            "index abc123..def456 100644\n" +
            "--- a/rustfmt.toml\n" +
            "+++ b/rustfmt.toml\n" +
            "@@ -1,2 +1,3 @@\n" +
            " max_width = 100\n" +
            '+edition = "2021"\n' +
            "diff --git a/tsconfig.json b/tsconfig.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/tsconfig.json\n" +
            "+++ b/tsconfig.json\n" +
            "@@ -1,2 +1,3 @@\n" +
            " {\n" +
            '+    "strict": true\n' +
            " }\n" +
            "diff --git a/vitest.config.mts b/vitest.config.mts\n" +
            "index abc123..def456 100644\n" +
            "--- a/vitest.config.mts\n" +
            "+++ b/vitest.config.mts\n" +
            "@@ -1,2 +1,3 @@\n" +
            " export default {\n" +
            "+    timeout: 5000\n" +
            " }\n" +
            "diff --git a/Makefile b/Makefile\n" +
            "index abc123..def456 100644\n" +
            "--- a/Makefile\n" +
            "+++ b/Makefile\n" +
            "@@ -1,2 +1,3 @@\n" +
            " build:\n" +
            "+\tgo build ./...\n" +
            "diff --git a/Rakefile b/Rakefile\n" +
            "index abc123..def456 100644\n" +
            "--- a/Rakefile\n" +
            "+++ b/Rakefile\n" +
            "@@ -1,2 +1,3 @@\n" +
            " task :default do\n" +
            "+  puts 'hello'\n" +
            " end\n" +
            "diff --git a/snippet.json b/snippet.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/snippet.json\n" +
            "+++ b/snippet.json\n" +
            "@@ -1,2 +1,3 @@\n" +
            " {\n" +
            '+    "snippet": "new"\n' +
            " }\n" +
            "diff --git a/.gitignore b/.gitignore\n" +
            "index abc123..def456 100644\n" +
            "--- a/.gitignore\n" +
            "+++ b/.gitignore\n" +
            "@@ -1,2 +1,3 @@\n" +
            " node_modules/\n" +
            "+dist/\n" +
            "diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/CONTRIBUTING.md\n" +
            "+++ b/CONTRIBUTING.md\n" +
            "@@ -1,2 +1,3 @@\n" +
            " # Contributing\n" +
            "+Please read the guidelines.\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain(".eslintrc");
        expect(cleaned).not.toContain(".rubocop");
        expect(cleaned).not.toContain("phpstan.neon");
        expect(cleaned).not.toContain("rustfmt.toml");
        expect(cleaned).not.toContain("tsconfig.json");
        expect(cleaned).not.toContain("vitest.config");
        expect(cleaned).not.toContain("Makefile");
        expect(cleaned).not.toContain("Rakefile");
        expect(cleaned).not.toContain("snippet.json");
        expect(cleaned).not.toContain(".gitignore");
        expect(cleaned).not.toContain("CONTRIBUTING");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesChangelogCaseInsensitive", () => {
        const diff =
            "diff --git a/CHANGELOG.md b/CHANGELOG.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/CHANGELOG.md\n" +
            "+++ b/CHANGELOG.md\n" +
            "@@ -1,3 +1,5 @@\n" +
            " # Changelog\n" +
            "+## 2.0.0\n" +
            "+- Breaking change\n" +
            " \n" +
            "diff --git a/changelog.md b/changelog.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/changelog.md\n" +
            "+++ b/changelog.md\n" +
            "@@ -1,2 +1,3 @@\n" +
            " # Changes\n" +
            "+- fix bug\n" +
            "diff --git a/src/index.ts b/src/index.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/index.ts\n" +
            "+++ b/src/index.ts\n" +
            "@@ -1,2 +1,3 @@\n" +
            " export { Client } from './Client';\n" +
            "+export { Types } from './types';\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("CHANGELOG");
        expect(cleaned).not.toContain("changelog");
        expect(cleaned).toContain("index.ts");
        expect(cleaned).toContain("+export { Types }");
    });

    it("testCleanDiffForAI_excludesReadmeCaseInsensitive", () => {
        const diff =
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # My SDK\n" +
            "+New feature docs\n" +
            " \n" +
            "diff --git a/readme.rst b/readme.rst\n" +
            "index abc123..def456 100644\n" +
            "--- a/readme.rst\n" +
            "+++ b/readme.rst\n" +
            "@@ -1,2 +1,3 @@\n" +
            " My SDK\n" +
            "+======\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("README");
        expect(cleaned).not.toContain("readme");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_preservesSourceFilesAndPackageJson", () => {
        // Verify that __init__.py, index.ts, package.json, pyproject.toml, go.mod
        // and src/** files are NOT excluded
        const diff =
            "diff --git a/src/__init__.py b/src/__init__.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/__init__.py\n" +
            "+++ b/src/__init__.py\n" +
            "@@ -1,2 +1,3 @@\n" +
            " from .client import Client\n" +
            "+from .new_module import NewModule\n" +
            "diff --git a/src/index.ts b/src/index.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/index.ts\n" +
            "+++ b/src/index.ts\n" +
            "@@ -1,2 +1,3 @@\n" +
            " export { Client } from './Client';\n" +
            "+export { NewType } from './NewType';\n" +
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -3,6 +3,7 @@\n" +
            '     "name": "my-sdk",\n' +
            '     "private": false,\n' +
            '+    "newDep": "^1.0.0",\n' +
            " }\n" +
            "diff --git a/pyproject.toml b/pyproject.toml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pyproject.toml\n" +
            "+++ b/pyproject.toml\n" +
            "@@ -1,3 +1,4 @@\n" +
            " [tool.poetry]\n" +
            '+new-dep = "^1.0"\n' +
            " \n" +
            "diff --git a/go.mod b/go.mod\n" +
            "index abc123..def456 100644\n" +
            "--- a/go.mod\n" +
            "+++ b/go.mod\n" +
            "@@ -1,3 +1,4 @@\n" +
            " module github.com/example/sdk\n" +
            "+require github.com/pkg/errors v0.9.1\n" +
            " \n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // All source files and config files should be preserved
        expect(cleaned).toContain("__init__.py");
        expect(cleaned).toContain("index.ts");
        expect(cleaned).toContain("package.json");
        expect(cleaned).toContain("pyproject.toml");
        expect(cleaned).toContain("go.mod");
        expect(cleaned).toContain("+from .new_module import NewModule");
        expect(cleaned).toContain("+export { NewType }");
        expect(cleaned).toContain('+    "newDep": "^1.0.0"');
    });

    it("testCleanDiffForAI_excludesNestedReferenceMd", () => {
        // reference.md in a subdirectory should also be excluded
        const diff =
            "diff --git a/docs/api/reference.md b/docs/api/reference.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/docs/api/reference.md\n" +
            "+++ b/docs/api/reference.md\n" +
            "@@ -1,3 +1,100 @@\n" +
            " # API Reference\n" +
            "+## Users endpoint added\n" +
            " \n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("reference.md");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesJavaTestFiles", () => {
        const diff =
            "diff --git a/src/test/java/com/example/ClientTest.java b/src/test/java/com/example/ClientTest.java\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/test/java/com/example/ClientTest.java\n" +
            "+++ b/src/test/java/com/example/ClientTest.java\n" +
            "@@ -1,3 +1,4 @@\n" +
            " public class ClientTest {\n" +
            "+    @Test void testNew() {}\n" +
            " }\n" +
            "diff --git a/src/main/java/com/example/Client.java b/src/main/java/com/example/Client.java\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/main/java/com/example/Client.java\n" +
            "+++ b/src/main/java/com/example/Client.java\n" +
            "@@ -1,3 +1,4 @@\n" +
            " public class Client {\n" +
            "+    public void newMethod() {}\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // Java test file matched by *Test.java naming convention
        expect(cleaned).not.toContain("ClientTest.java");
        // Source file should be preserved
        expect(cleaned).toContain("Client.java");
        expect(cleaned).toContain("+    public void newMethod() {}");
    });

    it("testCleanDiffForAI_excludesGoTestFiles", () => {
        const diff =
            "diff --git a/client_test.go b/client_test.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/client_test.go\n" +
            "+++ b/client_test.go\n" +
            "@@ -1,3 +1,4 @@\n" +
            " func TestClient(t *testing.T) {\n" +
            "+    // new test\n" +
            " }\n" +
            "diff --git a/client.go b/client.go\n" +
            "index abc123..def456 100644\n" +
            "--- a/client.go\n" +
            "+++ b/client.go\n" +
            "@@ -1,3 +1,4 @@\n" +
            " type Client struct {\n" +
            "+    NewField string\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("client_test.go");
        expect(cleaned).toContain("client.go");
        expect(cleaned).toContain("+    NewField string");
    });

    it("testCleanDiffForAI_excludesPythonAndSpecTestFiles", () => {
        const diff =
            "diff --git a/client_test.py b/client_test.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/client_test.py\n" +
            "+++ b/client_test.py\n" +
            "@@ -1,3 +1,4 @@\n" +
            " def test_client():\n" +
            "+    assert True\n" +
            " \n" +
            "diff --git a/api.spec.ts b/api.spec.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/api.spec.ts\n" +
            "+++ b/api.spec.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " describe('api', () => {\n" +
            "+    it('works', () => {});\n" +
            " });\n" +
            "diff --git a/helpers.test.py b/helpers.test.py\n" +
            "index abc123..def456 100644\n" +
            "--- a/helpers.test.py\n" +
            "+++ b/helpers.test.py\n" +
            "@@ -1,2 +1,3 @@\n" +
            " def test_helpers():\n" +
            "+    pass\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // _test.py, .test.py, and .spec.ts should be excluded
        expect(cleaned).not.toContain("client_test.py");
        expect(cleaned).not.toContain("api.spec.ts");
        expect(cleaned).not.toContain("helpers.test.py");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_combinedExclusionWithReferenceMdAndLockfile", () => {
        // This test specifically validates the acceptance criteria:
        // a diff containing reference.md and pnpm-lock.yaml is stripped
        const diff =
            "diff --git a/reference.md b/reference.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/reference.md\n" +
            "+++ b/reference.md\n" +
            "@@ -1,100 +1,200 @@\n" +
            " # API Reference\n" +
            "+## New Users Endpoint\n" +
            "+POST /api/v1/users\n" +
            "+Creates a new user account.\n" +
            " \n" +
            "diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pnpm-lock.yaml\n" +
            "+++ b/pnpm-lock.yaml\n" +
            "@@ -1,50 +1,55 @@\n" +
            " lockfileVersion: 5.4\n" +
            "+  axios: 1.6.0\n" +
            "+  lodash: 4.17.21\n" +
            " \n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -10,6 +10,10 @@\n" +
            " export class Client {\n" +
            "+    public async createUser(request: CreateUserRequest): Promise<User> {\n" +
            "+        return this.httpClient.post('/api/v1/users', request);\n" +
            "+    }\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // reference.md and pnpm-lock.yaml should be stripped
        expect(cleaned).not.toContain("reference.md");
        expect(cleaned).not.toContain("pnpm-lock.yaml");
        expect(cleaned).not.toContain("API Reference");
        expect(cleaned).not.toContain("lockfileVersion");
        // Source file changes should be preserved
        expect(cleaned).toContain("Client.ts");
        expect(cleaned).toContain("createUser");
    });

    it("testCleanDiffForAI_excludesCircleCIConfig", () => {
        const diff =
            "diff --git a/.circleci/config.yml b/.circleci/config.yml\n" +
            "index abc123..def456 100644\n" +
            "--- a/.circleci/config.yml\n" +
            "+++ b/.circleci/config.yml\n" +
            "@@ -1,3 +1,4 @@\n" +
            " version: 2.1\n" +
            "+  - run: npm test\n" +
            " \n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain(".circleci");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludesGenericLockFile", () => {
        // Tests the catch-all *.lock pattern
        const diff =
            "diff --git a/Gemfile.lock b/Gemfile.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/Gemfile.lock\n" +
            "+++ b/Gemfile.lock\n" +
            "@@ -1,3 +1,4 @@\n" +
            " GEM\n" +
            "+  faraday (2.7.0)\n" +
            " \n" +
            "diff --git a/composer.lock b/composer.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/composer.lock\n" +
            "+++ b/composer.lock\n" +
            "@@ -1,3 +1,4 @@\n" +
            " {\n" +
            '+    "packages": []\n' +
            " }\n" +
            "diff --git a/custom-tool.lock b/custom-tool.lock\n" +
            "index abc123..def456 100644\n" +
            "--- a/custom-tool.lock\n" +
            "+++ b/custom-tool.lock\n" +
            "@@ -1,2 +1,3 @@\n" +
            " lock data\n" +
            "+more lock data\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("Gemfile.lock");
        expect(cleaned).not.toContain("composer.lock");
        expect(cleaned).not.toContain("custom-tool.lock");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_excludes__tests__Directory", () => {
        const diff =
            "diff --git a/src/__tests__/client.test.ts b/src/__tests__/client.test.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/__tests__/client.test.ts\n" +
            "+++ b/src/__tests__/client.test.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " describe('Client', () => {\n" +
            "+    it('should call endpoint', () => {});\n" +
            " });\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("__tests__");
        expect(cleaned.trim()).toBe("");
    });

    it("testCleanDiffForAI_exclusionAppliedBeforeVersionCleaning", () => {
        // Verifies that file exclusion + version cleaning work together
        const diff =
            "diff --git a/reference.md b/reference.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/reference.md\n" +
            "+++ b/reference.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # API Reference\n" +
            "+## New endpoint\n" +
            " \n" +
            "diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml\n" +
            "index abc123..def456 100644\n" +
            "--- a/pnpm-lock.yaml\n" +
            "+++ b/pnpm-lock.yaml\n" +
            "@@ -1,3 +1,4 @@\n" +
            " lockfileVersion: 5.4\n" +
            "+  new-dep: 1.0.0\n" +
            " \n" +
            "diff --git a/package.json b/package.json\n" +
            "index abc123..def456 100644\n" +
            "--- a/package.json\n" +
            "+++ b/package.json\n" +
            "@@ -1,6 +1,6 @@\n" +
            " {\n" +
            '     "name": "test-sdk",\n' +
            '-    "version": "1.0.0",\n' +
            '+    "version": "505.503.4455",\n' +
            '     "private": false\n' +
            " }\n" +
            "diff --git a/src/Client.ts b/src/Client.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/Client.ts\n" +
            "+++ b/src/Client.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class Client {\n" +
            "+    newMethod() {}\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // Excluded files should be gone
        expect(cleaned).not.toContain("reference.md");
        expect(cleaned).not.toContain("pnpm-lock.yaml");
        // Version-only package.json should be cleaned away
        expect(cleaned).not.toContain("505.503.4455");
        expect(cleaned).not.toContain("package.json");
        // Real source changes should remain
        expect(cleaned).toContain("Client.ts");
        expect(cleaned).toContain("+    newMethod() {}");
    });

    it("testCleanDiffForAI_preservesFilesStartingWithReadmeOrChangelog", () => {
        // Files whose names merely START with "readme" or "changelog" but are
        // actual source files should NOT be excluded (only standalone README*/CHANGELOG* files)
        const diff =
            "diff --git a/src/readmeGenerator.ts b/src/readmeGenerator.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/readmeGenerator.ts\n" +
            "+++ b/src/readmeGenerator.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export class ReadmeGenerator {\n" +
            "+    generateReadme() {}\n" +
            " }\n" +
            "diff --git a/src/changelog_utils.ts b/src/changelog_utils.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/changelog_utils.ts\n" +
            "+++ b/src/changelog_utils.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export function formatChangelog() {\n" +
            "+    return 'formatted';\n" +
            " }\n" +
            "diff --git a/src/readmeConfig.ts b/src/readmeConfig.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/readmeConfig.ts\n" +
            "+++ b/src/readmeConfig.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export const config = {\n" +
            "+    title: 'My SDK',\n" +
            " };\n" +
            "diff --git a/src/changelogEntry.ts b/src/changelogEntry.ts\n" +
            "index abc123..def456 100644\n" +
            "--- a/src/changelogEntry.ts\n" +
            "+++ b/src/changelogEntry.ts\n" +
            "@@ -1,3 +1,4 @@\n" +
            " export interface ChangelogEntry {\n" +
            "+    date: string;\n" +
            " }\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        // All these source files should be PRESERVED (not excluded)
        expect(cleaned).toContain("readmeGenerator.ts");
        expect(cleaned).toContain("+    generateReadme() {}");
        expect(cleaned).toContain("changelog_utils.ts");
        expect(cleaned).toContain("+    return 'formatted';");
        expect(cleaned).toContain("readmeConfig.ts");
        expect(cleaned).toContain("+    title: 'My SDK',");
        expect(cleaned).toContain("changelogEntry.ts");
        expect(cleaned).toContain("+    date: string;");
    });

    it("testCleanDiffForAI_excludesReadmeAndChangelogWithVariousExtensions", () => {
        // Standalone README/CHANGELOG files with different extensions should be excluded
        const diff =
            "diff --git a/README b/README\n" +
            "index abc123..def456 100644\n" +
            "--- a/README\n" +
            "+++ b/README\n" +
            "@@ -1,2 +1,3 @@\n" +
            " My SDK\n" +
            "+Updated\n" +
            "diff --git a/CHANGELOG b/CHANGELOG\n" +
            "index abc123..def456 100644\n" +
            "--- a/CHANGELOG\n" +
            "+++ b/CHANGELOG\n" +
            "@@ -1,2 +1,3 @@\n" +
            " # Changes\n" +
            "+- new\n" +
            "diff --git a/README.txt b/README.txt\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.txt\n" +
            "+++ b/README.txt\n" +
            "@@ -1,2 +1,3 @@\n" +
            " Info\n" +
            "+More info\n" +
            "diff --git a/CHANGELOG.rst b/CHANGELOG.rst\n" +
            "index abc123..def456 100644\n" +
            "--- a/CHANGELOG.rst\n" +
            "+++ b/CHANGELOG.rst\n" +
            "@@ -1,2 +1,3 @@\n" +
            " Changes\n" +
            "+- fix\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("README");
        expect(cleaned).not.toContain("CHANGELOG");
        expect(cleaned.trim()).toBe("");
    });
});
