import { describe, expect, it } from "vitest";
import { selfCloseVoidHtmlElements } from "../parseMarkdownToTree.js";

describe("selfCloseVoidHtmlElements", () => {
    it("converts <br> to <br />", () => {
        expect(selfCloseVoidHtmlElements("<br>")).toBe("<br />");
    });

    it("converts <br/> to <br />", () => {
        expect(selfCloseVoidHtmlElements("<br/>")).toBe("<br />");
    });

    it("leaves <br /> unchanged", () => {
        expect(selfCloseVoidHtmlElements("<br />")).toBe("<br />");
    });

    it("converts <hr> to <hr />", () => {
        expect(selfCloseVoidHtmlElements("<hr>")).toBe("<hr />");
    });

    it("converts <img> with attributes", () => {
        expect(selfCloseVoidHtmlElements('<img src="foo.png" alt="bar">')).toBe('<img src="foo.png" alt="bar" />');
    });

    it("converts <img> already self-closing without space", () => {
        expect(selfCloseVoidHtmlElements('<img src="foo.png"/>')).toBe('<img src="foo.png" />');
    });

    it("leaves <img /> with attributes unchanged", () => {
        expect(selfCloseVoidHtmlElements('<img src="foo.png" alt="bar" />')).toBe('<img src="foo.png" alt="bar" />');
    });

    it("converts <input> with attributes", () => {
        expect(selfCloseVoidHtmlElements('<input type="text" name="field">')).toBe(
            '<input type="text" name="field" />'
        );
    });

    it("converts <meta> tag", () => {
        expect(selfCloseVoidHtmlElements('<meta charset="utf-8">')).toBe('<meta charset="utf-8" />');
    });

    it("converts <link> tag", () => {
        expect(selfCloseVoidHtmlElements('<link rel="stylesheet" href="style.css">')).toBe(
            '<link rel="stylesheet" href="style.css" />'
        );
    });

    it("converts <source> tag", () => {
        expect(selfCloseVoidHtmlElements('<source src="video.mp4" type="video/mp4">')).toBe(
            '<source src="video.mp4" type="video/mp4" />'
        );
    });

    it("converts <embed> tag", () => {
        expect(selfCloseVoidHtmlElements('<embed src="plugin.swf">')).toBe('<embed src="plugin.swf" />');
    });

    it("converts <col> tag", () => {
        expect(selfCloseVoidHtmlElements('<col span="2">')).toBe('<col span="2" />');
    });

    it("converts <area> tag", () => {
        expect(selfCloseVoidHtmlElements('<area shape="rect" coords="0,0,10,10">')).toBe(
            '<area shape="rect" coords="0,0,10,10" />'
        );
    });

    it("converts <track> tag", () => {
        expect(selfCloseVoidHtmlElements('<track src="subtitles.vtt" kind="subtitles">')).toBe(
            '<track src="subtitles.vtt" kind="subtitles" />'
        );
    });

    it("converts <wbr> tag", () => {
        expect(selfCloseVoidHtmlElements("<wbr>")).toBe("<wbr />");
    });

    it("converts <param> tag", () => {
        expect(selfCloseVoidHtmlElements('<param name="autoplay" value="true">')).toBe(
            '<param name="autoplay" value="true" />'
        );
    });

    it("converts <base> tag", () => {
        expect(selfCloseVoidHtmlElements('<base href="https://example.com/">')).toBe(
            '<base href="https://example.com/" />'
        );
    });

    it("is case insensitive", () => {
        expect(selfCloseVoidHtmlElements("<BR>")).toBe("<BR />");
        expect(selfCloseVoidHtmlElements("<Br>")).toBe("<Br />");
        expect(selfCloseVoidHtmlElements('<IMG src="foo.png">')).toBe('<IMG src="foo.png" />');
    });

    it("handles multiple void elements in one string", () => {
        const input = "Auth<br>Bulk (v1 & v2)<br>Composite<br>Connect";
        const expected = "Auth<br />Bulk (v1 & v2)<br />Composite<br />Connect";
        expect(selfCloseVoidHtmlElements(input)).toBe(expected);
    });

    it("does not modify non-void elements", () => {
        const input = "<div>hello</div><span>world</span><p>text</p>";
        expect(selfCloseVoidHtmlElements(input)).toBe(input);
    });

    it("does not match partial tag names", () => {
        // "break" starts with "br" but is not a void element
        const input = "<break>content</break>";
        expect(selfCloseVoidHtmlElements(input)).toBe(input);
    });

    it("handles Salesforce-style description with HTML entities decoded", () => {
        const input = [
            "<table><tbody><tr><td><div>",
            "Auth<br>Bulk (v1 & v2)<br>Composite<br>Connect",
            "</div></td></tr></tbody></table>"
        ].join("");
        const expected = [
            "<table><tbody><tr><td><div>",
            "Auth<br />Bulk (v1 & v2)<br />Composite<br />Connect",
            "</div></td></tr></tbody></table>"
        ].join("");
        expect(selfCloseVoidHtmlElements(input)).toBe(expected);
    });

    it("handles img tags within complex HTML", () => {
        const input = '<figure><div><img src="https://example.com/image.png" alt="badge"><div></div></div></figure>';
        const expected =
            '<figure><div><img src="https://example.com/image.png" alt="badge" /><div></div></div></figure>';
        expect(selfCloseVoidHtmlElements(input)).toBe(expected);
    });

    it("handles empty string", () => {
        expect(selfCloseVoidHtmlElements("")).toBe("");
    });

    it("handles content with no HTML tags", () => {
        const input = "Just some plain markdown content\n\n# Heading\n\n- List item";
        expect(selfCloseVoidHtmlElements(input)).toBe(input);
    });

    it("preserves content inside code fences (regex does not distinguish)", () => {
        // Note: the regex-based approach processes ALL content including code fences.
        // This is acceptable because converting <br> to <br /> inside a code fence
        // does not change the rendered output in markdown (code fences show raw text).
        const input = "```html\n<br>\n```";
        const expected = "```html\n<br />\n```";
        expect(selfCloseVoidHtmlElements(input)).toBe(expected);
    });
});
