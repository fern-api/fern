import { describe, expect, it, vi } from "vitest";
import { Block } from "../readme/Block.js";
import { BlockMerger } from "../readme/BlockMerger.js";
import { ReadmeParser } from "../readme/ReadmeParser.js";

describe("ReadmeParser", () => {
    const parser = new ReadmeParser();

    it("parses blocks by ## headings", () => {
        const content = `# My SDK

Some intro text.

## Installation
Install with npm.

## Usage
Use the client.

## Contributing
Open a PR.
`;
        const result = parser.parse({ content });

        expect(result.blocks).toHaveLength(3);
        expect(result.blocks[0]?.id).toBe("INSTALLATION");
        expect(result.blocks[1]?.id).toBe("USAGE");
        expect(result.blocks[2]?.id).toBe("CONTRIBUTING");
    });

    it("filters out Table of Contents block", () => {
        const content = `# My SDK

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)

## Installation
Install with npm.

## Usage
Use the client.
`;
        const result = parser.parse({ content });

        expect(result.blocks).toHaveLength(2);
        expect(result.blocks[0]?.id).toBe("INSTALLATION");
        expect(result.blocks[1]?.id).toBe("USAGE");
    });

    it("creates duplicate block IDs when README has duplicate ## headings", () => {
        // This is the exact scenario that causes the BlockMerger crash:
        // When the OAuth addendum injects a ## Authentication heading inside the Usage block,
        // the next generation's ReadmeParser sees two separate ## Authentication sections.
        const content = `# Kard Java Library

## Usage
\`\`\`java
KardApiClient client = KardApiClient.builder().build();
\`\`\`

## Authentication
The API uses OAuth for authentication.

## Authentication
To use OAuth, override the default token provider:
\`\`\`java
FernDemoApiClient.builder()
  .credentials(OAuthTokenProvider.of("clientId", "clientSecret"))
  .build();
\`\`\`

## Contributing
Please open a PR.
`;
        const result = parser.parse({ content });

        // Parser creates blocks for each ## heading, including duplicates
        const authBlocks = result.blocks.filter((b) => b.id === "AUTHENTICATION");
        expect(authBlocks).toHaveLength(2);
        expect(authBlocks[0]?.content).toContain("The API uses OAuth");
        expect(authBlocks[1]?.content).toContain("override the default token provider");
    });

    it("parses single AUTHENTICATION block correctly after fix", () => {
        // With Fix 3: AUTHENTICATION is a proper feature block, so there's only one.
        const content = `# Kard Java Library

## Usage
\`\`\`java
FernDemoApiClient client = FernDemoApiClient.builder().build();
\`\`\`

## Authentication
This SDK supports two authentication methods:

### Option 1: Direct Bearer Token
\`\`\`java
FernDemoApiClient client = FernDemoApiClient.builder()
    .token("your-access-token")
    .build();
\`\`\`

### Option 2: OAuth Client Credentials
\`\`\`java
FernDemoApiClient client = FernDemoApiClient.builder()
    .credentials("client-id", "client-secret")
    .build();
\`\`\`

## Contributing
Please open a PR.
`;
        const result = parser.parse({ content });

        const authBlocks = result.blocks.filter((b) => b.id === "AUTHENTICATION");
        expect(authBlocks).toHaveLength(1);
        expect(authBlocks[0]?.content).toContain("two authentication methods");
        // ### headings should NOT create new blocks (only ## does)
        expect(authBlocks[0]?.content).toContain("### Option 1");
        expect(authBlocks[0]?.content).toContain("### Option 2");
    });

    it("extracts header content before first ## heading", () => {
        const content = `# My SDK

[![badge](https://example.com/badge.svg)](https://example.com)

The My SDK library provides convenient access to the APIs.

## Installation
Install with npm.
`;
        const result = parser.parse({ content });

        expect(result.header).toContain("# My SDK");
        expect(result.header).toContain("badge");
        expect(result.header).toContain("convenient access");
        expect(result.blocks).toHaveLength(1);
        expect(result.blocks[0]?.id).toBe("INSTALLATION");
    });

    it("preserves block content including code blocks and ### sub-headings", () => {
        const content = `# SDK

## Authentication
This SDK supports OAuth:

### Option 1: Bearer Token

\`\`\`java
Client client = Client.builder().token("token").build();
\`\`\`

### Option 2: OAuth

\`\`\`java
Client client = Client.builder().credentials("id", "secret").build();
\`\`\`

## Contributing
Open a PR.
`;
        const result = parser.parse({ content });

        expect(result.blocks).toHaveLength(2);
        const authBlock = result.blocks[0];
        expect(authBlock?.id).toBe("AUTHENTICATION");
        // Block content should include everything from ## Authentication to ## Contributing
        expect(authBlock?.content).toContain("## Authentication");
        expect(authBlock?.content).toContain("### Option 1: Bearer Token");
        expect(authBlock?.content).toContain("### Option 2: OAuth");
        expect(authBlock?.content).toContain("Client.builder().token");
        expect(authBlock?.content).toContain("Client.builder().credentials");
    });

    it("converts multi-word headings to screaming snake case IDs", () => {
        const content = `# SDK

## Exception Handling
Handle exceptions.

## Access Raw Response Data
Get raw responses.

## Custom Client
Use custom client.
`;
        const result = parser.parse({ content });

        expect(result.blocks).toHaveLength(3);
        expect(result.blocks[0]?.id).toBe("EXCEPTION_HANDLING");
        expect(result.blocks[1]?.id).toBe("ACCESS_RAW_RESPONSE_DATA");
        expect(result.blocks[2]?.id).toBe("CUSTOM_CLIENT");
    });

    it("handles README with only header and no ## sections", () => {
        const content = `# My SDK

Just a simple README with no sections.
`;
        const result = parser.parse({ content });

        expect(result.blocks).toHaveLength(0);
        expect(result.header).toContain("# My SDK");
    });
});

describe("ReadmeParser → BlockMerger pipeline", () => {
    const parser = new ReadmeParser();

    it("stable AUTHENTICATION block survives parse-merge-parse cycle (idempotency)", () => {
        // Simulates what happens across two generation runs:
        // 1. First run produces a README with a stable AUTHENTICATION block
        // 2. Second run parses that README and merges with new generated blocks
        // The result should be identical — proving merge stability.

        const readmeAfterFirstRun = `# Example Java Library

## Installation

### Gradle
\`\`\`groovy
dependencies {
    implementation 'com.example:example-java:1.0.0'
}
\`\`\`

## Usage

Use the client to make API calls.

\`\`\`java
ExampleApiClient client = ExampleApiClient.builder()
    .token("your-token")
    .build();
\`\`\`

## Authentication

This SDK supports two authentication methods:

### Option 1: Direct Bearer Token

\`\`\`java
ExampleApiClient client = ExampleApiClient.builder()
    .token("your-access-token")
    .build();
\`\`\`

### Option 2: OAuth Client Credentials

\`\`\`java
ExampleApiClient client = ExampleApiClient.builder()
    .credentials("client-id", "client-secret")
    .build();
\`\`\`

## Contributing

Open a PR.
`;

        // Parse the README from first run
        const parsed = parser.parse({ content: readmeAfterFirstRun });

        // Verify parse produces correct blocks with unique IDs
        const blockIds = parsed.blocks.map((b) => b.id);
        expect(blockIds).toEqual(["INSTALLATION", "USAGE", "AUTHENTICATION", "CONTRIBUTING"]);

        // No duplicate IDs
        expect(new Set(blockIds).size).toBe(blockIds.length);

        // Simulate second generation: create updated blocks (same content)
        const updatedBlocks = [
            new Block({ id: "INSTALLATION", content: parsed.blocks[0]?.content ?? "" }),
            new Block({ id: "USAGE", content: parsed.blocks[1]?.content ?? "" }),
            new Block({ id: "AUTHENTICATION", content: parsed.blocks[2]?.content ?? "" }),
            new Block({ id: "CONTRIBUTING", content: parsed.blocks[3]?.content ?? "" })
        ];

        // Merge: should produce same blocks with no warnings
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original: parsed.blocks, updated: updatedBlocks });
        const result = merger.merge();

        expect(result).toHaveLength(4);
        expect(result.map((b) => b.id)).toEqual(["INSTALLATION", "USAGE", "AUTHENTICATION", "CONTRIBUTING"]);
        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("duplicate AUTHENTICATION from old bug is healed by merge with single updated block", () => {
        // Simulates the healing scenario: existing README has duplicate ## Authentication
        // from the old addendum bug. New generation has a single AUTHENTICATION block.
        // The merge should produce a clean result.

        const brokenReadme = `# Kard Java Library

## Usage

\`\`\`java
KardApiClient client = KardApiClient.builder().build();
\`\`\`

## Authentication

The API uses OAuth for authentication.
\`\`\`java
KardApiClient.builder()
    .credentials(OAuthTokenProvider.of("clientId", "clientSecret"))
    .build();
\`\`\`

## Authentication

To use OAuth, override the default token provider:
\`\`\`java
FernDemoApiClient.builder()
    .credentials(OAuthTokenProvider.of("clientId", "clientSecret"))
    .build();
\`\`\`

## Contributing

Please open a PR.
`;

        // Parse the broken README — produces duplicate AUTHENTICATION blocks
        const parsed = parser.parse({ content: brokenReadme });
        const authBlocks = parsed.blocks.filter((b) => b.id === "AUTHENTICATION");
        expect(authBlocks).toHaveLength(2);

        // New generation produces clean blocks with single AUTHENTICATION
        const updatedBlocks = [
            new Block({ id: "USAGE", content: "## Usage\n\nUpdated usage.\n" }),
            new Block({
                id: "AUTHENTICATION",
                content: "## Authentication\n\nThis SDK supports two auth methods.\n"
            }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\n\nOpen a PR.\n" })
        ];

        // Merge should succeed (not crash) and produce clean result
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original: parsed.blocks, updated: updatedBlocks });
        const result = merger.merge();

        // Should have exactly one AUTHENTICATION block (the updated one)
        const resultAuthBlocks = result.filter((b) => b.id === "AUTHENTICATION");
        expect(resultAuthBlocks).toHaveLength(1);
        expect(resultAuthBlocks[0]?.content).toContain("two auth methods");

        // Both duplicate original AUTHENTICATION blocks exist in updatedByID (single updated AUTHENTICATION),
        // so the first is processed and the second is skipped via processedUpdated.has() — no warn needed.
        // The important thing is: no crash and only one AUTHENTICATION in the result.

        warnSpy.mockRestore();
    });

    it("new AUTHENTICATION block is inserted when not present in original README", () => {
        // Simulates upgrading from a generator that didn't produce AUTHENTICATION
        // to one that does — the new block should be added.

        const oldReadme = `# SDK

## Installation

Install with npm.

## Usage

Use the client.

## Contributing

Open a PR.
`;

        const parsed = parser.parse({ content: oldReadme });
        expect(parsed.blocks.map((b) => b.id)).toEqual(["INSTALLATION", "USAGE", "CONTRIBUTING"]);

        const updatedBlocks = [
            new Block({ id: "INSTALLATION", content: "## Installation\n\nNew install.\n" }),
            new Block({ id: "USAGE", content: "## Usage\n\nNew usage.\n" }),
            new Block({
                id: "AUTHENTICATION",
                content: "## Authentication\n\nOAuth documentation.\n"
            }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\n\nOpen a PR.\n" })
        ];

        const merger = new BlockMerger({ original: parsed.blocks, updated: updatedBlocks });
        const result = merger.merge();

        // AUTHENTICATION should be present in the result
        expect(result.map((b) => b.id)).toContain("AUTHENTICATION");
        const authBlock = result.find((b) => b.id === "AUTHENTICATION");
        expect(authBlock?.content).toContain("OAuth documentation");
    });
});
