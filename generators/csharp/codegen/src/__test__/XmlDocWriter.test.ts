import { XmlDocWriter } from "../ast/core/XmlDocWriter";
import { Writer } from "../ast/core/Writer";

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
    describe("preserves valid XML doc tags", () => {
        it("should preserve anchor tags with href", () => {
            const result = escapeXmlDocContent(
                'For more information, read <a href="https://example.com">docs</a>'
            );
            expect(result).toBe('For more information, read <a href="https://example.com">docs</a>');
        });

        it("should preserve code tags", () => {
            const result = escapeXmlDocContent("Use the <code>GetValue()</code> method");
            expect(result).toBe("Use the <code>GetValue()</code> method");
        });

        it("should preserve list tags", () => {
            const result = escapeXmlDocContent("<ul><li>Item 1</li><li>Item 2</li></ul>");
            expect(result).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
        });

        it("should preserve see cref tags", () => {
            const result = escapeXmlDocContent('See <see cref="MyClass"/> for details');
            expect(result).toBe('See <see cref="MyClass"/> for details');
        });

        it("should preserve self-closing tags", () => {
            const result = escapeXmlDocContent("Line 1<br/>Line 2");
            expect(result).toBe("Line 1<br/>Line 2");
        });

        it("should preserve self-closing tags with space", () => {
            const result = escapeXmlDocContent("Line 1<br />Line 2");
            expect(result).toBe("Line 1<br />Line 2");
        });

        it("should preserve emphasis tags", () => {
            const result = escapeXmlDocContent("This is <em>important</em> and <strong>critical</strong>");
            expect(result).toBe("This is <em>important</em> and <strong>critical</strong>");
        });

        it("should preserve paragraph tags", () => {
            const result = escapeXmlDocContent("<p>First paragraph</p><p>Second paragraph</p>");
            expect(result).toBe("<p>First paragraph</p><p>Second paragraph</p>");
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
            const result = escapeXmlDocContent('<permission cref="System.Security.Permissions.FileIOPermission">Requires read access</permission>');
            expect(result).toBe('<permission cref="System.Security.Permissions.FileIOPermission">Requires read access</permission>');
        });

        it("should preserve listheader tags", () => {
            const result = escapeXmlDocContent('<list type="table"><listheader><term>Name</term><description>Value</description></listheader></list>');
            expect(result).toBe('<list type="table"><listheader><term>Name</term><description>Value</description></listheader></list>');
        });

        it("should preserve underline tags", () => {
            const result = escapeXmlDocContent('This is <u>underlined</u> text');
            expect(result).toBe('This is <u>underlined</u> text');
        });

        it("should preserve tags case-insensitively", () => {
            const result = escapeXmlDocContent('<A HREF="https://example.com">Link</A>');
            expect(result).toBe('<A HREF="https://example.com">Link</A>');
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
        it("should handle comparison within sentence with link", () => {
            const result = escapeXmlDocContent(
                'When x < y, see <a href="https://example.com">docs</a>'
            );
            expect(result).toBe('When x &lt; y, see <a href="https://example.com">docs</a>');
        });

        it("should handle multiple valid tags with escaped content", () => {
            const result = escapeXmlDocContent(
                "Use <code>a < b</code> to check if a < b in the <em>comparison</em>"
            );
            expect(result).toBe(
                "Use <code>a &lt; b</code> to check if a &lt; b in the <em>comparison</em>"
            );
        });

        it("should preserve complex link with comparison text", () => {
            const result = escapeXmlDocContent(
                'For values where n > 5, see <a href="/docs">documentation</a>'
            );
            expect(result).toBe('For values where n &gt; 5, see <a href="/docs">documentation</a>');
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

        it("should handle mixed entities and tags", () => {
            const result = escapeXmlDocContent(
                '<a href="https://example.com">Link</a> &copy; 2024'
            );
            expect(result).toBe('<a href="https://example.com">Link</a> \u00A9 2024');
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

        it("should handle tags with multiple attributes", () => {
            const result = escapeXmlDocContent(
                '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
            );
            expect(result).toBe(
                '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
            );
        });

        it("should handle real-world auth0 example", () => {
            const result = escapeXmlDocContent(
                'For more information, read <a href="https://www.auth0.com/docs/get-started/applications"> Applications in Auth0</a>'
            );
            expect(result).toBe(
                'For more information, read <a href="https://www.auth0.com/docs/get-started/applications"> Applications in Auth0</a>'
            );
        });
    });
});
