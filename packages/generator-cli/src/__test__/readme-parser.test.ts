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
});
