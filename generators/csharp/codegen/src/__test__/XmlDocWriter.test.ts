import { Writer } from "../ast/core/Writer.js";
import { XmlDocWriter } from "../ast/core/XmlDocWriter.js";

/**
 * Simple mock writer that captures written content.
 * Implements the minimal interface needed by XmlDocWriter.
 */
class MockWriter {
    private buffer = "";

    write(text: string): void {
        this.buffer += text;
    }

    writeLine(text = ""): void {
        this.buffer += text + "\n";
    }

    writeNewLineIfLastLineNot(): void {
        if (!this.buffer.endsWith("\n")) {
            this.buffer += "\n";
        }
    }

    writeNode(): void {
        // No-op for tests
    }

    toString(): string {
        return this.buffer;
    }
}

/**
 * Helper to test escapeXmlDocContent by capturing the output of writeWithEscaping.
 * Uses a mock writer since the full Writer class has complex dependencies.
 */
function escapeXmlDocContent(text: string): string {
    const writer = new MockWriter();
    const xmlDocWriter = new XmlDocWriter(writer as unknown as Writer);
    xmlDocWriter.writeWithEscaping(text);
    return writer.toString();
}

describe("XmlDocWriter.escapeXmlDocContent", () => {
    describe("converts HTML tags to XMLDoc equivalents", () => {
        it("should convert inline <code> to <c>", () => {
            const result = escapeXmlDocContent("Use the <code>GetValue()</code> method");
            expect(result).toBe("Use the <c>GetValue()</c> method");
        });

        it("should convert <pre><code> to <code> (block code)", () => {
            const result = escapeXmlDocContent("<pre><code>var x = 1;</code></pre>");
            expect(result).toBe("<code>var x = 1;</code>");
        });

        it("should convert <pre> without <code> child to <code>", () => {
            const result = escapeXmlDocContent("<pre>var x = 1;</pre>");
            expect(result).toBe("<code>var x = 1;</code>");
        });

        it("should convert <a href> to <see href>", () => {
            const result = escapeXmlDocContent('For more information, read <a href="https://example.com">docs</a>');
            expect(result).toBe('For more information, read <see href="https://example.com">docs</see>');
        });

        it("should convert <ul><li> to <list type='bullet'>", () => {
            const result = escapeXmlDocContent("<ul><li>Item 1</li><li>Item 2</li></ul>");
            expect(result).toBe(
                '<list type="bullet"><item><description>Item 1</description></item><item><description>Item 2</description></item></list>'
            );
        });

        it("should convert <ol><li> to <list type='number'>", () => {
            const result = escapeXmlDocContent("<ol><li>First</li><li>Second</li></ol>");
            expect(result).toBe(
                '<list type="number"><item><description>First</description></item><item><description>Second</description></item></list>'
            );
        });

        it("should convert <p> to <para>", () => {
            const result = escapeXmlDocContent("<p>First paragraph</p><p>Second paragraph</p>");
            expect(result).toBe("<para>First paragraph</para><para>Second paragraph</para>");
        });

        it("should convert <em> to <i> and <strong> to <b>", () => {
            const result = escapeXmlDocContent("This is <em>important</em> and <strong>critical</strong>");
            expect(result).toBe("This is <i>important</i> and <b>critical</b>");
        });

        it("should convert deprecated <tt> to <c>", () => {
            const result = escapeXmlDocContent("Use <tt>getValue()</tt> to retrieve");
            expect(result).toBe("Use <c>getValue()</c> to retrieve");
        });

        it("should convert headings to <para>", () => {
            const result = escapeXmlDocContent("<h3>Section Title</h3>");
            expect(result).toBe("<para>Section Title</para>");
        });

        it("should handle nested HTML: <li> with <code>", () => {
            const result = escapeXmlDocContent("<li><code>field</code>: description</li>");
            expect(result).toBe("<item><description><c>field</c>: description</description></item>");
        });

        it("should convert case-insensitive HTML tags", () => {
            const result = escapeXmlDocContent('<A HREF="https://example.com">Link</A>');
            expect(result).toBe('<see href="https://example.com">Link</see>');
        });

        it("should strip div, span, table tags and keep content", () => {
            const result = escapeXmlDocContent("<div><span>text</span></div>");
            expect(result).toBe("text");
        });
    });

    describe("preserves valid XMLDoc tags", () => {
        it("should preserve see cref tags", () => {
            const result = escapeXmlDocContent('See <see cref="MyClass"/> for details');
            expect(result).toBe('See <see cref="MyClass"/> for details');
        });

        it("should preserve self-closing br tags", () => {
            const result = escapeXmlDocContent("Line 1<br/>Line 2");
            expect(result).toBe("Line 1<br/>Line 2");
        });

        it("should normalize <br /> to <br/>", () => {
            const result = escapeXmlDocContent("Line 1<br />Line 2");
            expect(result).toBe("Line 1<br/>Line 2");
        });

        it("should preserve paramref tags", () => {
            const result = escapeXmlDocContent('See <paramref name="value"/> parameter');
            expect(result).toBe('See <paramref name="value"/> parameter');
        });

        it("should preserve typeparam tags", () => {
            const result = escapeXmlDocContent('<typeparam name="T">The type parameter</typeparam>');
            expect(result).toBe('<typeparam name="T">The type parameter</typeparam>');
        });

        it("should preserve include tags", () => {
            const result = escapeXmlDocContent('<include file="docs.xml" path="doc/summary"/>');
            expect(result).toBe('<include file="docs.xml" path="doc/summary"/>');
        });

        it("should preserve permission tags", () => {
            const result = escapeXmlDocContent(
                '<permission cref="System.Security.Permissions.FileIOPermission">Requires read access</permission>'
            );
            expect(result).toBe(
                '<permission cref="System.Security.Permissions.FileIOPermission">Requires read access</permission>'
            );
        });

        it("should preserve listheader tags", () => {
            const result = escapeXmlDocContent(
                '<list type="table"><listheader><term>Name</term><description>Value</description></listheader></list>'
            );
            expect(result).toBe(
                '<list type="table"><listheader><term>Name</term><description>Value</description></listheader></list>'
            );
        });

        it("should preserve underline tags", () => {
            const result = escapeXmlDocContent("This is <u>underlined</u> text");
            expect(result).toBe("This is <u>underlined</u> text");
        });

        it("should preserve already-valid <c> tags", () => {
            const result = escapeXmlDocContent("Use <c>myMethod</c> here");
            expect(result).toBe("Use <c>myMethod</c> here");
        });

        it("should preserve already-valid <para> tags", () => {
            const result = escapeXmlDocContent("<para>Already XMLDoc</para>");
            expect(result).toBe("<para>Already XMLDoc</para>");
        });

        it("should preserve already-valid <list> tags", () => {
            const result = escapeXmlDocContent(
                '<list type="bullet"><item><description>item</description></item></list>'
            );
            expect(result).toBe('<list type="bullet"><item><description>item</description></item></list>');
        });
    });

    describe("escapes standalone angle brackets", () => {
        it("should escape less-than comparison", () => {
            const result = escapeXmlDocContent("When a < b");
            expect(result).toBe("When a &lt; b");
        });

        it("should escape greater-than comparison", () => {
            const result = escapeXmlDocContent("When value > 100");
            expect(result).toBe("When value &gt; 100");
        });

        it("should escape both comparisons", () => {
            const result = escapeXmlDocContent("Use when 0 < x < 10");
            expect(result).toBe("Use when 0 &lt; x &lt; 10");
        });

        it("should escape generic type syntax", () => {
            const result = escapeXmlDocContent("Returns a List<string>");
            expect(result).toBe("Returns a List&lt;string&gt;");
        });

        it("should escape nested generic types", () => {
            const result = escapeXmlDocContent("Returns Dictionary<string, List<int>>");
            expect(result).toBe("Returns Dictionary&lt;string, List&lt;int&gt;&gt;");
        });
    });

    describe("handles mixed content", () => {
        it("should handle comparison within sentence with converted link", () => {
            const result = escapeXmlDocContent('When x < y, see <a href="https://example.com">docs</a>');
            expect(result).toBe('When x &lt; y, see <see href="https://example.com">docs</see>');
        });

        it("should handle multiple converted tags with escaped content", () => {
            const result = escapeXmlDocContent("Use <code>a < b</code> to check if a < b in the <em>comparison</em>");
            expect(result).toBe("Use <c>a &lt; b</c> to check if a &lt; b in the <i>comparison</i>");
        });

        it("should handle converted link with comparison text", () => {
            const result = escapeXmlDocContent('For values where n > 5, see <a href="/docs">documentation</a>');
            expect(result).toBe('For values where n &gt; 5, see <see href="/docs">documentation</see>');
        });

        it("should handle entity-encoded headings as text (not tags)", () => {
            const result = escapeXmlDocContent("&lt;h5&gt;Title&lt;/h5&gt;");
            expect(result).toBe("&lt;h5&gt;Title&lt;/h5&gt;");
        });
    });

    describe("handles malformed or unsafe tags", () => {
        it("should escape unclosed tag", () => {
            const result = escapeXmlDocContent("This is <a incomplete tag");
            expect(result).toBe("This is &lt;a incomplete tag");
        });

        it("should escape tag with space after <", () => {
            const result = escapeXmlDocContent("This is < a not a tag >");
            expect(result).toBe("This is &lt; a not a tag &gt;");
        });

        it("should escape unknown tags", () => {
            const result = escapeXmlDocContent("<script>alert('xss')</script>");
            expect(result).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
        });

        it("should escape custom unknown tags", () => {
            const result = escapeXmlDocContent("<mytag>content</mytag>");
            expect(result).toBe("&lt;mytag&gt;content&lt;/mytag&gt;");
        });
    });

    describe("handles HTML entity decoding", () => {
        it("should decode &plus; entity", () => {
            const result = escapeXmlDocContent("a &plus; b");
            expect(result).toBe("a + b");
        });

        it("should decode multiple entities", () => {
            const result = escapeXmlDocContent("a &lt; b &amp;&amp; c &gt; d");
            // &lt; and &gt; are decoded then re-escaped, &amp; is not in the entity map
            expect(result).toBe("a &lt; b &amp;&amp; c &gt; d");
        });

        it("should decode numeric entities", () => {
            const result = escapeXmlDocContent("Copyright &#169; 2024");
            expect(result).toBe("Copyright \u00A9 2024");
        });

        it("should decode hex entities", () => {
            const result = escapeXmlDocContent("Em dash &#x2014; here");
            expect(result).toBe("Em dash \u2014 here");
        });

        it("should handle mixed entities and converted tags", () => {
            const result = escapeXmlDocContent('<a href="https://example.com">Link</a> &copy; 2024');
            expect(result).toBe('<see href="https://example.com">Link</see> \u00A9 2024');
        });
    });

    describe("edge cases", () => {
        it("should handle empty string", () => {
            const result = escapeXmlDocContent("");
            expect(result).toBe("");
        });

        it("should handle string with no special characters", () => {
            const result = escapeXmlDocContent("Just plain text");
            expect(result).toBe("Just plain text");
        });

        it("should handle multiple consecutive tags", () => {
            const result = escapeXmlDocContent("<b><i>bold italic</i></b>");
            expect(result).toBe("<b><i>bold italic</i></b>");
        });

        it("should convert anchor tag keeping only href attribute", () => {
            const result = escapeXmlDocContent('<a href="https://example.com" target="_blank" rel="noopener">Link</a>');
            expect(result).toBe('<see href="https://example.com">Link</see>');
        });

        it("should handle real-world auth0 example", () => {
            const result = escapeXmlDocContent(
                'For more information, read <a href="https://www.auth0.com/docs/get-started/applications"> Applications in Auth0</a>'
            );
            expect(result).toBe(
                'For more information, read <see href="https://www.auth0.com/docs/get-started/applications"> Applications in Auth0</see>'
            );
        });
    });
});
