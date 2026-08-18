import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { transformAtPrefixImports } from "../transformAtPrefixImports.js";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");

describe("transformAtPrefixImports", () => {
    it("should transform named imports with @/ prefix", () => {
        const markdown = `import { Banner } from '@/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../components/Banner'`);
    });

    it("should transform default imports with @/ prefix", () => {
        const markdown = `import Banner from '@/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import Banner from '../components/Banner'`);
    });

    it("should transform namespace imports with @/ prefix", () => {
        const markdown = `import * as Components from '@/components'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import * as Components from '../components'`);
    });

    it("should transform side-effect imports with @/ prefix", () => {
        const markdown = `import '@/styles/global.css'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import '../styles/global.css'`);
    });

    it("should handle deeply nested MDX files", () => {
        const markdown = `import { Banner } from '@/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/docs/guides/getting-started/intro.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../../../components/Banner'`);
    });

    it("should handle MDX files at fern folder root", () => {
        const markdown = `import { Banner } from '@/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from './components/Banner'`);
    });

    it("should transform multiple imports in the same file", () => {
        const markdown = `import { Banner } from '@/components/Banner'
import { Card } from '@/components/Card'
import styles from '@/styles/page.module.css'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../components/Banner'
import { Card } from '../components/Card'
import styles from '../styles/page.module.css'`);
    });

    it("should not transform imports without @/ prefix", () => {
        const markdown = `import { Banner } from './components/Banner'
import React from 'react'
import { something } from '../utils'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(markdown);
    });

    it("should handle imports with double quotes", () => {
        const markdown = `import { Banner } from "@/components/Banner"`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from "../components/Banner"`);
    });

    it("should handle mixed @/ and regular imports", () => {
        const markdown = `import { Banner } from '@/components/Banner'
import React from 'react'
import { Card } from '@/components/Card'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../components/Banner'
import React from 'react'
import { Card } from '../components/Card'`);
    });

    it("should handle imports with file extensions", () => {
        const markdown = `import { Banner } from '@/components/Banner.tsx'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../components/Banner.tsx'`);
    });

    it("should handle imports with multiple named exports", () => {
        const markdown = `import { Banner, Card, Button } from '@/components'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner, Card, Button } from '../components'`);
    });

    it("should preserve markdown content around imports", () => {
        const markdown = `# My Page

import { Banner } from '@/components/Banner'

Some content here.

<Banner />`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`# My Page

import { Banner } from '../components/Banner'

Some content here.

<Banner />`);
    });

    it("should not transform imports inside fenced code blocks", () => {
        const markdown = `---
title: Tutorial
---

import { Banner } from '@/components/Banner'

Update the imports:

\`\`\`jsx showLineNumbers={false} title="content-fallback.tsx"
import { Flex, ProgressCircle } from "@/components/ui/big-design";
\`\`\`

<Banner />`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/guides/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`---
title: Tutorial
---

import { Banner } from '../../components/Banner'

Update the imports:

\`\`\`jsx showLineNumbers={false} title="content-fallback.tsx"
import { Flex, ProgressCircle } from "@/components/ui/big-design";
\`\`\`

<Banner />`);
    });

    it("should not transform imports inside inline code", () => {
        const markdown = `Write \`import { Flex } from "@/components/ui/big-design"\` at the top.`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(markdown);
    });

    it("should resolve real imports when the body opens with a thematic break", () => {
        // `---` immediately after the frontmatter makes gray-matter non-idempotent, so stripping
        // frontmatter twice shifts every code-block offset. The shift only misaligns at certain
        // body lengths, so sweep padding widths rather than hard-coding one that happens to break.
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        for (let pad = 0; pad < 60; pad++) {
            const markdown = [
                "---",
                "title: X",
                "---",
                "---",
                "a".repeat(pad),
                "---",
                "",
                "import { Banner } from '@/components/Banner'",
                "",
                "```jsx",
                'import { Flex } from "@/components/ui/big-design";',
                "```"
            ].join("\n");

            const result = transformAtPrefixImports({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile
            });

            // the page-level import resolves, the code sample is left verbatim
            expect(result, `pad=${pad}`).toContain("import { Banner } from '../components/Banner'");
            expect(result, `pad=${pad}`).toContain('import { Flex } from "@/components/ui/big-design";');
        }
    });

    it("should not throw on malformed frontmatter", () => {
        const markdown = `---
title: "unterminated
---

import { Banner } from '@/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");

        expect(() =>
            transformAtPrefixImports({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile
            })
        ).not.toThrow();
    });

    it("should handle imports in sibling directories", () => {
        const markdown = `import { Banner } from '@/docs/components/Banner'`;
        const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/guides/test.mdx");

        const result = transformAtPrefixImports({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile
        });

        expect(result).toBe(`import { Banner } from '../../docs/components/Banner'`);
    });
});
