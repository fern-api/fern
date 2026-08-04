import {
    APP_INFO_TYPE_NAME,
    APPEND_APP_INFO_METHOD_NAME,
    buildAppendAppInfoMethodLines,
    buildAppInfoClassLines
} from "../buildAppInfoUserAgent.js";

describe("buildAppInfoUserAgent", () => {
    it("exposes the emitted type and helper names", () => {
        expect(APP_INFO_TYPE_NAME).toBe("AppInfo");
        expect(APPEND_APP_INFO_METHOD_NAME).toBe("AppendAppInfoToUserAgent");
    });

    describe("buildAppInfoClassLines", () => {
        const source = buildAppInfoClassLines("Acme.Sdk").join("\n");

        it("emits a sealed record in the requested namespace", () => {
            expect(source).toContain("namespace Acme.Sdk;");
            expect(source).toContain("public sealed record AppInfo");
        });

        it("makes Name required and Version/Comment optional init-only properties", () => {
            expect(source).toContain("public required string Name { get; init; }");
            expect(source).toContain("public string? Version { get; init; }");
            expect(source).toContain("public string? Comment { get; init; }");
        });
    });

    describe("buildAppendAppInfoMethodLines", () => {
        const body = buildAppendAppInfoMethodLines().join("\n");

        it("returns the User-Agent unchanged when appInfo is null", () => {
            expect(body).toContain("if (appInfo == null)");
            expect(body).toContain("return userAgent;");
        });

        it("returns the User-Agent unchanged when the trimmed name is blank (no whitespace-junk token)", () => {
            // Name is trimmed BEFORE the blank check and BEFORE encoding, so a
            // whitespace-only name is dropped rather than encoded into `%20%20`.
            expect(body).toContain("var name = EncodeToken((appInfo.Name ?? string.Empty).Trim());");
            expect(body).toContain("if (name.Length == 0)");
        });

        it("trims version and comment before encoding and omits blank segments", () => {
            expect(body).toContain("var version = EncodeToken((appInfo.Version ?? string.Empty).Trim());");
            expect(body).toContain("if (version.Length > 0)");
            expect(body).toContain('productToken += "/" + version;');
            expect(body).toContain("var comment = EncodeComment((appInfo.Comment ?? string.Empty).Trim());");
            expect(body).toContain("if (comment.Length > 0)");
            expect(body).toContain('productToken += " (" + comment + ")";');
        });

        it("percent-encodes non-RFC-7230 tchar characters in name/version (spaces, CR/LF, control chars)", () => {
            // EncodeToken only preserves the RFC 7230 token set; everything else
            // (including space, CR, LF) is percent-encoded from its UTF-8 bytes.
            expect(body).toContain("static string EncodeToken(string value)");
            expect(body).toContain("(ch >= 'a' && ch <= 'z')");
            expect(body).toContain("(ch >= 'A' && ch <= 'Z')");
            expect(body).toContain("(ch >= '0' && ch <= '9')");
            expect(body).toContain(`"!#$%&'*+-.^_\`|~".IndexOf(ch) >= 0`);
        });

        it("escapes comment delimiters (), backslash and control chars incl. CR/LF (paren/CRLF injection)", () => {
            expect(body).toContain("static string EncodeComment(string value)");
            // `(`, `)`, `\`, control chars (<= 0x1F, incl. \r \n) and 0x7F are escaped.
            expect(body).toContain("if (ch == '(' || ch == ')' || ch == '\\\\' || ch <= '\\u001f' || ch == '\\u007f')");
        });

        it("percent-encodes from UTF-8 bytes so multi-byte characters cannot inject header content", () => {
            expect(body).toContain(
                "static void AppendPercentEncoded(global::System.Text.StringBuilder builder, char ch)"
            );
            expect(body).toContain("global::System.Text.Encoding.UTF8.GetBytes(new[] { ch })");
            expect(body).toContain(`builder.Append('%').Append(b.ToString("X2"));`);
        });

        it("only uses netstandard2.0/net462-safe APIs (StringBuilder, no regex)", () => {
            expect(body).toContain("global::System.Text.StringBuilder");
            expect(body).not.toContain("Regex");
            expect(body).not.toContain("System.Text.RegularExpressions");
        });

        it("appends the sanitized product token to the User-Agent", () => {
            expect(body).toContain('return userAgent + " " + productToken;');
        });
    });
});
