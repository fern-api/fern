import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import {
    createLibrarySymbolUsageTracker,
    type LibrarySymbolReference,
    type RenderedLibrarySymbolMdx,
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
    const pages: AbsoluteFilePath[] = [];
    const renderSymbol = async (
        ref: LibrarySymbolReference,
        absolutePathToMarkdownFile: AbsoluteFilePath
    ): Promise<RenderedLibrarySymbolMdx> => {
        calls.push(ref);
        pages.push(absolutePathToMarkdownFile);
        return { mdx: `RENDERED(${ref.library}:${ref.name})\nline2`, anchorIds: [] };
    };
    return { calls, pages, renderSymbol };
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
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => {
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
            renderSymbol: async () => ({ mdx: `Usage: \`${tag}\``, anchorIds: [] })
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

    it("accepts the JSX array form for 'members'", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        await replaceLibrarySymbols({
            markdown: [
                "<LibrarySymbol",
                '  library="lib"',
                '  name="Client"',
                "  members={[\"set_parameter\", 'get_parameter']}",
                "/>"
            ].join("\n"),
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls).toEqual([
            { library: "lib", name: "Client", heading: undefined, members: ["set_parameter", "get_parameter"] }
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

    it("leaves tags inside fenced code, inline code and MDX comments untouched", async () => {
        const { calls, renderSymbol } = makeRecordingRenderer();
        const markdown = [
            "Use it like this:",
            "",
            "```mdx",
            '<LibrarySymbol library="docs-example" name="Fenced" />',
            "```",
            "",
            "~~~",
            '  <LibrarySymbol library="docs-example" name="Tilde" />',
            "~~~",
            "",
            'Inline: `<LibrarySymbol library="docs-example" name="Inline" />` renders a symbol.',
            "",
            '{/* <LibrarySymbol library="docs-example" name="Commented" /> */}',
            "",
            '<LibrarySymbol library="lib" name="Live" />'
        ].join("\n");
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls.map((c) => c.name)).toEqual(["Live"]);
        expect(result).toContain('<LibrarySymbol library="docs-example" name="Fenced" />');
        expect(result).toContain('<LibrarySymbol library="docs-example" name="Tilde" />');
        expect(result).toContain('`<LibrarySymbol library="docs-example" name="Inline" />`');
        expect(result).toContain('{/* <LibrarySymbol library="docs-example" name="Commented" /> */}');
        expect(result).toContain("RENDERED(lib:Live)");
    });

    it("handles multi-backtick code spans and closing fences longer than the opener", async () => {
        const { calls, renderSymbol } = makeRecordingRenderer();
        const markdown = [
            'Use ``<LibrarySymbol library="docs-example" name="Double" />`` literally.',
            "",
            "```",
            '<LibrarySymbol library="docs-example" name="Fenced" />',
            "````",
            "",
            '<LibrarySymbol library="lib" name="Live" />'
        ].join("\n");
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls.map((c) => c.name)).toEqual(["Live"]);
        expect(result).toContain('``<LibrarySymbol library="docs-example" name="Double" />``');
        expect(result).toContain('<LibrarySymbol library="docs-example" name="Fenced" />');
        expect(result).toContain("RENDERED(lib:Live)");
    });

    it("leaves tags inside YAML frontmatter untouched while replacing the body", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const markdown = [
            "---",
            "title: Client",
            'description: \'Use <LibrarySymbol library="sdk" name="Client" /> to embed it\'',
            "---",
            "",
            '<LibrarySymbol library="sdk" name="Client" />'
        ].join("\n");
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls).toHaveLength(1);
        expect(result).toContain('description: \'Use <LibrarySymbol library="sdk" name="Client" /> to embed it\'');
        expect(result).toContain("---\n\nRENDERED(sdk:Client)");
    });

    it("also treats CRLF frontmatter as inert", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const markdown =
            '---\r\ndescription: "<LibrarySymbol library=\\"sdk\\" name=\\"Client\\" />"\r\n---\r\n\r\n<LibrarySymbol library="sdk" name="Client" />';
        await replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol });
        expect(calls).toHaveLength(1);
    });

    it("fails when an included symbol duplicates an anchor the author already placed on the page", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ["reset"]
        });
        for (const authored of ["## Reset [#reset]", '<Anchor id="reset">Reset</Anchor>']) {
            const markdown = [authored, "", '<LibrarySymbol library="lib" name="Client::reset" />'].join("\n");
            await expect(
                replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol })
            ).rejects.toThrow(/a\.mdx:3\].*'#reset'.*already used by the authored anchor '#reset' \(line 1\)/);
        }
    });

    it("ignores authored anchors inside inert regions", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ["reset"]
        });
        const markdown = [
            "```md",
            "## Reset [#reset]",
            "```",
            'Use `## Reset [#reset]` or {/* <Anchor id="reset"> */}',
            '<LibrarySymbol library="lib" name="Client::reset" />'
        ].join("\n");
        await expect(
            replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol })
        ).resolves.toContain("RENDERED(Client::reset)");
    });

    it("fails when two different symbols on one page emit the same anchor", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ["reset"]
        });
        const markdown = [
            '<LibrarySymbol library="lib" name="alpha::Client::reset" />',
            '<LibrarySymbol library="lib" name="beta::Client::reset" />'
        ].join("\n");
        await expect(
            replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol })
        ).rejects.toThrow(
            /a\.mdx:2\].*'#reset'.*already used by <LibrarySymbol library="lib" name="alpha::Client::reset" \/> \(line 1\)/
        );
    });

    it("fails when a member anchor of one class collides with a member anchor of another", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: [ref.name.toLowerCase(), "reset"]
        });
        const markdown = [
            '<LibrarySymbol library="lib" name="Alpha" />',
            "",
            '<LibrarySymbol library="lib" name="Beta" />'
        ].join("\n");
        await expect(
            replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol })
        ).rejects.toThrow(
            /a\.mdx:3\].*name="Beta".*'#reset'.*name="Alpha".*\(line 1\).*Narrow the class with 'members'/
        );
    });

    it("fails when a class's member anchor collides with a separately included method", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ref.name === "Client" ? ["client", "solve", "reset"] : ["reset"]
        });
        const markdown = [
            '<LibrarySymbol library="lib" name="Client" />',
            '<LibrarySymbol library="lib" name="Client::reset" />'
        ].join("\n");
        await expect(
            replaceLibrarySymbols({ markdown, absolutePathToMarkdownFile: pageA, context, renderSymbol })
        ).rejects.toThrow(/a\.mdx:2\].*'#reset'.*name="Client" \/> \(line 1\)/);
    });

    it("allows a member-filtered class next to a method it no longer emits", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ref.name === "Client" ? ["client", ...(ref.members ?? [])] : ["reset"]
        });
        const markdown = [
            '<LibrarySymbol library="lib" name="Client" members="solve" />',
            '<LibrarySymbol library="lib" name="Client::reset" />'
        ].join("\n");
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(result).toBe("RENDERED(Client)\nRENDERED(Client::reset)");
    });

    it("fails when the same symbol is included twice on one page and emits an anchor", async () => {
        const renderSymbol = async (ref: LibrarySymbolReference): Promise<RenderedLibrarySymbolMdx> => ({
            mdx: `RENDERED(${ref.name})`,
            anchorIds: ["reset"]
        });
        const tag = '<LibrarySymbol library="lib" name="Client::reset" />';
        await expect(
            replaceLibrarySymbols({
                markdown: `${tag}\n${tag}`,
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(/a\.mdx:2\].*'#reset'.*\(line 1\).*Include each symbol at most once per page/);
    });

    it("does not let an unclosed opener inside inline code swallow the next live tag", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        const markdown = [
            'Start with `<LibrarySymbol library="demo"` and add a name.',
            "",
            '<LibrarySymbol library="demo" name="Client" />'
        ].join("\n");
        const result = await replaceLibrarySymbols({
            markdown,
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(calls.map((c) => c.name)).toEqual(["Client"]);
        expect(result).toContain('`<LibrarySymbol library="demo"`');
        expect(result).toContain("RENDERED(demo:Client)");
    });

    it("rejects unknown attributes with file:line context", async () => {
        const { renderSymbol, calls } = makeRecordingRenderer();
        await expect(
            replaceLibrarySymbols({
                markdown: '\n<LibrarySymbol library="lib" name="pkg.Thing" member="reset" />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(
            /\[\/path\/to\/fern\/pages\/a\.mdx:2\] Invalid <LibrarySymbol \/>: Unknown attribute 'member'\. Supported attributes: library, name, heading, members/
        );
        expect(calls).toHaveLength(0);
    });

    it("rejects duplicate attributes", async () => {
        const { renderSymbol } = makeRecordingRenderer();
        await expect(
            replaceLibrarySymbols({
                markdown: '<LibrarySymbol library="lib" name="pkg.A" name="pkg.B" />',
                absolutePathToMarkdownFile: pageA,
                context,
                renderSymbol
            })
        ).rejects.toThrow(/a\.mdx:1\] Invalid <LibrarySymbol \/>: Duplicate attribute 'name'/);
    });

    it("passes the authored page path to the renderer", async () => {
        const { renderSymbol, pages } = makeRecordingRenderer();
        await replaceLibrarySymbols({
            markdown: '<LibrarySymbol library="lib" name="pkg.Thing" />',
            absolutePathToMarkdownFile: pageA,
            context,
            renderSymbol
        });
        expect(pages).toEqual([pageA]);
    });
});
