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
