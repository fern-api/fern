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
    const command = args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ");
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
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,5 +1,5 @@\n" +
            " # Test Package\n" +
            "-Version: 1.0.0\n" +
            "+Version: 505.503.4455\n" +
            " \n" +
            " ## Features\n" +
            "+- New awesome feature\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).toContain("# Test Package");
        expect(cleaned).toContain("## Features");
        expect(cleaned).toContain("- New awesome feature");
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
            "diff --git a/README.md b/README.md\n" +
            "index abc123..def456 100644\n" +
            "--- a/README.md\n" +
            "+++ b/README.md\n" +
            "@@ -1,3 +1,4 @@\n" +
            " # My SDK\n" +
            " \n" +
            "+New feature added!\n" +
            " ## Installation\n";

        const cleaned = new AutoVersioningService({ logger: mockLogger }).cleanDiffForAI(diff, "505.503.4455");

        expect(cleaned).not.toContain("package.json");
        expect(cleaned).toContain("README.md");
        expect(cleaned).toContain("+New feature added!");
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
});
