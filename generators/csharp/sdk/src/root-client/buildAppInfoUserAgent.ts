/**
 * Source-building helpers for the opt-in `allow-user-agent-app-info` feature.
 *
 * When the flag is on, the generated client exposes an optional `AppInfo`
 * (`Name`, `Version?`, `Comment?`) client option whose sanitized product token is
 * appended to whatever `User-Agent` the SDK would otherwise send, producing e.g.
 * `my-sdk/1.2.0 (linux; x86_64) dotnet/8.0.4 partner-app/3.1.0 (+https://partner.example)`
 * per RFC 9110 §10.1.5.
 *
 * The static `AppendAppInfoToUserAgent` helper is emitted into the generated root
 * client only when the flag is on (and a `User-Agent` is actually written), so the
 * shared always-shipped core-utilities are never modified and flag-off output stays
 * byte-for-byte identical. The helper is self-contained: it percent-encodes every
 * non-RFC-7230 `tchar` in `Name`/`Version` and escapes the comment delimiters
 * (`(`, `)`, `\`) and control characters (incl. CR/LF) in `Comment`, so
 * caller-supplied values cannot inject additional header content. Each value is
 * trimmed before checking for blankness and before encoding, so blank values are
 * treated as absent (dropped) rather than encoded into whitespace tokens.
 *
 * These are split out from the generator so the deterministic C# body can be
 * unit-tested (and compiled) without constructing a full generation context. Only
 * netstandard2.0/net462-safe APIs are used (StringBuilder + UTF-8 bytes), so no new
 * package reference is required.
 */

export const APP_INFO_TYPE_NAME = "AppInfo";
export const APPEND_APP_INFO_METHOD_NAME = "AppendAppInfoToUserAgent";

const ENCODING = "global::System.Text.Encoding";
const STRING_BUILDER = "global::System.Text.StringBuilder";

/**
 * The lines of the standalone public `AppInfo` class (`Name`, `Version?`,
 * `Comment?`), emitted into public core only when `allow-user-agent-app-info`
 * is enabled.
 */
export function buildAppInfoClassLines(namespace: string): string[] {
    return [
        `namespace ${namespace};`,
        "",
        "/// <summary>",
        "/// Application information appended to the <c>User-Agent</c> header as an",
        "/// RFC 9110 product token (<c>{Name}/{Version} ({Comment})</c>). Set via",
        "/// <c>ClientOptions.AppInfo</c>; caller-supplied values are sanitized before",
        "/// being written to the header.",
        "/// </summary>",
        "public sealed record AppInfo",
        "{",
        "    /// <summary>",
        "    /// The product name. Required; when null, empty, or whitespace the",
        "    /// <c>User-Agent</c> is left unchanged.",
        "    /// </summary>",
        "    public required string Name { get; init; }",
        "",
        "    /// <summary>",
        "    /// The optional product version. Omitted from the token when null or blank.",
        "    /// </summary>",
        "    public string? Version { get; init; }",
        "",
        "    /// <summary>",
        "    /// An optional comment (e.g. a homepage URL). Omitted from the token when",
        "    /// null or blank.",
        "    /// </summary>",
        "    public string? Comment { get; init; }",
        "}"
    ];
}

/**
 * The body statements of the emitted static `AppendAppInfoToUserAgent(string
 * userAgent, AppInfo? appInfo)` helper. `appInfoTypeName` is the (possibly
 * qualified) C# type name to reference for the `appInfo` parameter.
 */
export function buildAppendAppInfoMethodLines(): string[] {
    return [
        "if (appInfo == null)",
        "{",
        "    return userAgent;",
        "}",
        // RFC 7230 token = 1*tchar. Any character outside that set is percent-encoded
        // (from its UTF-8 bytes) so it cannot break out of the product token or inject
        // additional header content (spaces, control characters, CR/LF included).
        `static string EncodeToken(string value)`,
        "{",
        `    var builder = new ${STRING_BUILDER}(value.Length);`,
        "    foreach (var ch in value)",
        "    {",
        "        if (",
        `            (ch >= 'a' && ch <= 'z')`,
        `            || (ch >= 'A' && ch <= 'Z')`,
        `            || (ch >= '0' && ch <= '9')`,
        `            || "!#$%&'*+-.^_\`|~".IndexOf(ch) >= 0`,
        "        )",
        "        {",
        "            builder.Append(ch);",
        "        }",
        "        else",
        "        {",
        "            AppendPercentEncoded(builder, ch);",
        "        }",
        "    }",
        "    return builder.ToString();",
        "}",
        // Escape the comment delimiters `(`, `)`, `\` and control characters
        // (0x00-0x1F, 0x7F, incl. CR/LF) so a caller-supplied comment cannot terminate
        // the comment group early or inject additional header content.
        `static string EncodeComment(string value)`,
        "{",
        `    var builder = new ${STRING_BUILDER}(value.Length);`,
        "    foreach (var ch in value)",
        "    {",
        "        if (ch == '(' || ch == ')' || ch == '\\\\' || ch <= '\\u001f' || ch == '\\u007f')",
        "        {",
        "            AppendPercentEncoded(builder, ch);",
        "        }",
        "        else",
        "        {",
        "            builder.Append(ch);",
        "        }",
        "    }",
        "    return builder.ToString();",
        "}",
        `static void AppendPercentEncoded(${STRING_BUILDER} builder, char ch)`,
        "{",
        `    foreach (var b in ${ENCODING}.UTF8.GetBytes(new[] { ch }))`,
        "    {",
        "        builder.Append('%').Append(b.ToString(\"X2\"));",
        "    }",
        "}",
        "var name = EncodeToken((appInfo.Name ?? string.Empty).Trim());",
        "if (name.Length == 0)",
        "{",
        "    return userAgent;",
        "}",
        "var productToken = name;",
        "var version = EncodeToken((appInfo.Version ?? string.Empty).Trim());",
        "if (version.Length > 0)",
        "{",
        '    productToken += "/" + version;',
        "}",
        "var comment = EncodeComment((appInfo.Comment ?? string.Empty).Trim());",
        "if (comment.Length > 0)",
        "{",
        '    productToken += " (" + comment + ")";',
        "}",
        'return userAgent + " " + productToken;'
    ];
}
