import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import {
    createLibrarySymbolUsageTracker,
    type LibrarySymbolReference,
    replaceLibrarySymbols
} from "../replaceLibrarySymbols.js";

const pageA = AbsoluteFilePath.of("/path/to/fern/pages/a.mdx");
const pageB = AbsoluteFilePath.of("/path/to/fern/pages/b.mdx");
const context = createMockTaskContext();

function makeContextWithWarnSpy() {
    const warnSpy = vi.fn();
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: warnSpy,
        error: vi.fn(),
        trace: vi.fn(),
        log: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn()
    };
    return { context: createMockTaskContext({ logger }), warnSpy };
}

function makeRecordingRenderer() {
    const calls: LibrarySymbolReference[] = [];
    const renderSymbol = async (ref: LibrarySymbolReference): Promise<string> => {
        calls.push(ref);
        return `RENDERED(${ref.library}:${ref.name})\nline2`;
    };
    return { calls, renderSymbol };
}

describe("replaceLibrarySymbols", () => {
    it("returns markdown untouched when there is no tag", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const markdown = "# Hello\n\nNo symbols here.";
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(result).toBe(markdown);
        expect(calls).toHaveLength(0);
    });

    it("replaces tags and parses quoted + braced attributes", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const markdown = [
            "## Types",
            "",
            '<LibrarySymbol library="cuopt-c" name="cuOptGetIntSize" />',
            "",
            "<LibrarySymbol",
            '  library="cuopt-python"',
            '  name="cuopt.linear_programming.SolverSettings"',
            "  heading={3}",
            '  members="set_parameter, get_parameter"',
            "/>"
        ].join("\n");

        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });

        expect(result).toContain("RENDERED(cuopt-c:cuOptGetIntSize)");
        expect(result).toContain("RENDERED(cuopt-python:cuopt.linear_programming.SolverSettings)");
        expect(result).not.toContain("<LibrarySymbol");
        expect(calls).toEqual([
            { library: "cuopt-c", name: "cuOptGetIntSize", heading: undefined, members: undefined },
            {
                library: "cuopt-python",
                name: "cuopt.linear_programming.SolverSettings",
                heading: 3,
                members: ["set_parameter", "get_parameter"]
            }
        ]);
    });

    it("preserves the indentation of the tag on every rendered line", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        const markdown = '<Tab>\n    <LibrarySymbol library="lib" name="x" />\n</Tab>';
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(result).toBe("<Tab>\n    RENDERED(lib:x)\n    line2\n</Tab>");
    });

    it("accepts heading as a quoted string", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        await replaceLibrarySymbols({
            markdown: '<LibrarySymbol library="lib" name="x" heading="4" />',
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls[0]?.heading).toBe(4);
    });

    it("fails with file:line when 'library' or 'name' is missing", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        await expect(
            replaceLibrarySymbols({
                markdown: 'intro\n\n<LibrarySymbol name="x" />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(
            "[/path/to/fern/pages/a.mdx:3] Invalid <LibrarySymbol />: Missing required attribute 'library'"
        );

        await expect(
            replaceLibrarySymbols({
                markdown: '<LibrarySymbol library="lib" />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow("Missing required attribute 'name'");
    });

    it("rejects heading levels outside 1-6", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        await expect(
            replaceLibrarySymbols({
                markdown: '<LibrarySymbol library="lib" name="x" heading={7} />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow("Attribute 'heading' must be an integer between 1 and 6, got '7'");
    });

    it("surfaces renderer errors (unknown library / symbol) with file:line and the tag", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<string> => {
            throw new Error(`Unknown library '${ref.library}'. Libraries configured in docs.yml: cuopt-c`);
        };
        await expect(
            replaceLibrarySymbols({
                markdown: '# Title\n\nText\n\n<LibrarySymbol library="nope" name="foo" />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(
            `[/path/to/fern/pages/a.mdx:5] <LibrarySymbol library="nope" name="foo" />: Unknown library 'nope'. Libraries configured in docs.yml: cuopt-c`
        );
    });

    it("warns when the same symbol is included from two different pages", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        const { context: warnContext, warnSpy } = makeContextWithWarnSpy();
        const usageTracker = createLibrarySymbolUsageTracker();
        const markdown = '<LibrarySymbol library="lib" name="pkg.Thing" />';

        await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context: warnContext,
            renderSymbol,
            usageTracker
        });
        expect(warnSpy).not.toHaveBeenCalled();

        await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageB,
            context: warnContext,
            renderSymbol,
            usageTracker
        });
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0]?.[0]).toContain(
            "[/path/to/fern/pages/b.mdx:1] Symbol 'pkg.Thing' from library 'lib' is also included in /path/to/fern/pages/a.mdx"
        );
    });

    it("replaces identical tags independently and warns about the intra-page duplicate", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const { context: warnContext, warnSpy } = makeContextWithWarnSpy();
        const tag = '<LibrarySymbol library="lib" name="pkg.Thing" />';
        const result = await replaceLibrarySymbols({
            markdown: `${tag}\n\nprose\n\n${tag}`,
            absolutePathToMarkdownFile: pageA,
            context: warnContext,
            renderSymbol,
            usageTracker: createLibrarySymbolUsageTracker()
        });
        expect(result).not.toContain("<LibrarySymbol");
        expect(result.match(/RENDERED\(lib:pkg\.Thing\)/g)).toHaveLength(2);
        expect(calls).toHaveLength(2);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0]?.[0]).toContain("[/path/to/fern/pages/a.mdx:5]");
        expect(warnSpy.mock.calls[0]?.[0]).toContain("earlier in this page");
    });

    it("does not re-replace tag text that the renderer itself emits", async () => {
        const tag = '<LibrarySymbol library="lib" name="pkg.Thing" />';
        const result = await replaceLibrarySymbols({
            markdown: tag,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol: async () => `Usage: \`${tag}\``
        });
        expect(result).toBe(`Usage: \`${tag}\``);
    });

    it("accepts '>' and '=' inside attribute values", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        await replaceLibrarySymbols({
            markdown: '<LibrarySymbol library="lib" name="ns::Vec<int>::at" members="a=b, c" />',
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls).toEqual([
            { library: "lib", name: "ns::Vec<int>::at", heading: undefined, members: ["a=b", "c"] }
        ]);
    });

    it("rejects unbalanced or unparseable attributes", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        await expect(
            replaceLibrarySymbols({
                markdown: '<LibrarySymbol library="lib" name="pkg.Thing />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(/Could not parse attributes near 'name="pkg.Thing'/);
        await expect(
            replaceLibrarySymbols({
                markdown: '<LibrarySymbol library="lib" name="pkg.Thing" bogus />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(/Could not parse attributes near 'bogus'/);
    });
});
