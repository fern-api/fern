using global::System;
using global::System.Collections.Generic;
using global::System.Linq;
using global::System.Security.Cryptography;
using global::System.Text;

namespace <%= namespace%>;

/// <summary>
/// Cryptographic helpers for verifying incoming webhook signatures.
/// </summary>
internal static class WebhookSignature
{
    /// <summary>
    /// Compute the HMAC signature of a payload using the given secret, algorithm, and encoding.
    /// </summary>
    internal static string ComputeHmacSignature(
        string payload,
        string secret,
        string algorithm,
        string encoding
    )
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        using var hmac = CreateHmac(algorithm, keyBytes);
        var hash = hmac.ComputeHash(payloadBytes);
        return encoding == "hex" ? ToHex(hash) : Convert.ToBase64String(hash);
    }

    private static HMAC CreateHmac(string algorithm, byte[] key)
    {
        return algorithm switch
        {
            "sha1" => new HMACSHA1(key),
            "sha256" => new HMACSHA256(key),
            "sha384" => new HMACSHA384(key),
            "sha512" => new HMACSHA512(key),
            _ => throw new ArgumentException($"Unrecognized HMAC algorithm: {algorithm}"),
        };
    }

    /// <summary>
    /// Compute an unkeyed digest of a payload using the given algorithm and encoding.
    /// Used to verify a body-hash binding, where a hash of the raw request body is
    /// transmitted separately from (and independently of) the outer HMAC signature.
    /// </summary>
    internal static string ComputeHash(string payload, string algorithm, string encoding)
    {
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        using var hasher = CreateHashAlgorithm(algorithm);
        var hash = hasher.ComputeHash(payloadBytes);
        return encoding == "hex" ? ToHex(hash) : Convert.ToBase64String(hash);
    }

    private static HashAlgorithm CreateHashAlgorithm(string algorithm)
    {
        return algorithm switch
        {
            "sha1" => SHA1.Create(),
            "sha256" => SHA256.Create(),
            "sha384" => SHA384.Create(),
            "sha512" => SHA512.Create(),
            _ => throw new ArgumentException($"Unrecognized hash algorithm: {algorithm}"),
        };
    }

    /// <summary>
    /// Read a single query parameter from a URL without modifying, reordering, or
    /// reconstructing the URL. Returns null when the URL cannot be parsed or the
    /// parameter is absent.
    /// </summary>
    internal static string? GetQueryParameter(string url, string name)
    {
        if (url == null || name == null)
        {
            return null;
        }

        string query;
        try
        {
            query = new Uri(url, UriKind.Absolute).Query;
        }
        catch (FormatException)
        {
            return null;
        }

        if (query.Length == 0)
        {
            return null;
        }

        // Strip the leading '?' that Uri.Query includes.
        if (query[0] == '?')
        {
            query = query.Substring(1);
        }

        foreach (var pair in query.Split('&'))
        {
            if (pair.Length == 0)
            {
                continue;
            }
            var separatorIndex = pair.IndexOf('=');
            var key = separatorIndex >= 0 ? pair.Substring(0, separatorIndex) : pair;
            if (Uri.UnescapeDataString(key) != name)
            {
                continue;
            }
            var value = separatorIndex >= 0 ? pair.Substring(separatorIndex + 1) : string.Empty;
            return Uri.UnescapeDataString(value);
        }

        return null;
    }

    private static string ToHex(byte[] bytes)
    {
        var builder = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes)
        {
            builder.Append(b.ToString("x2"));
        }
        return builder.ToString();
    }

    /// <summary>
    /// Compare two strings in constant time to avoid leaking information through timing.
    /// </summary>
    internal static bool TimingSafeEqual(string a, string b)
    {
        var bytesA = Encoding.UTF8.GetBytes(a);
        var bytesB = Encoding.UTF8.GetBytes(b);
#if NET6_0_OR_GREATER || NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        // CryptographicOperations.FixedTimeEquals shipped in .NET Core 2.1+ (and
        // netstandard2.1), so every TFM except net462/netstandard2.0 uses the built-in
        // constant-time compare.
        return CryptographicOperations.FixedTimeEquals(bytesA, bytesB);
#else
        // FixedTimeEquals is unavailable on net462/netstandard2.0, so fall back to a
        // portable constant-time comparison. The length check is folded into the
        // accumulator (rather than an early return) so the comparison remains
        // constant-time even when the operands differ in length.
        var result = bytesA.Length ^ bytesB.Length;
        var length = global::System.Math.Min(bytesA.Length, bytesB.Length);
        for (var i = 0; i < length; i++)
        {
            result |= bytesA[i] ^ bytesB[i];
        }
        return result == 0;
#endif
    }

    /// <summary>
    /// Build the list of normalized notification-URL forms to verify a webhook signature
    /// against. Some providers (e.g. Twilio) are inconsistent about whether the URL they
    /// signed carried a port and how its query string was encoded, so a signature is
    /// accepted if it matches the computation over ANY of these candidates.
    ///
    /// Always includes at least the caller-supplied URL and never throws: an unparseable
    /// URL yields a single-element list containing the URL as-is.
    /// </summary>
    internal static IReadOnlyList<string> NotificationUrlCandidates(
        string url,
        bool portVariants,
        bool legacyQueryEncoding
    )
    {
        Uri parsed;
        try
        {
            parsed = new Uri(url, UriKind.Absolute);
        }
        catch (Exception)
        {
            return new List<string> { url };
        }

        var portForms = portVariants
            ? new List<string> { RemovePort(parsed), AddPort(parsed) }
            : new List<string> { url };

        // Preserve insertion order while collapsing forms that coincide (e.g. a URL that
        // already carries a standard port, or a query-less URL under legacy encoding).
        var candidates = new List<string>();
        var seen = new HashSet<string>();
        void Add(string candidate)
        {
            if (seen.Add(candidate))
            {
                candidates.Add(candidate);
            }
        }

        Add(url);
        foreach (var form in portForms)
        {
            Add(form);
        }
        if (legacyQueryEncoding)
        {
            foreach (var form in portForms)
            {
                Add(WithLegacyQuerystring(form));
            }
        }

        return candidates;
    }

    private static string BuildUrlWithStandardPort(Uri parsedUrl)
    {
        var port = parsedUrl.Scheme == "https" ? ":443" : ":80";
        var builder = new StringBuilder();
        builder.Append(parsedUrl.Scheme);
        builder.Append("://");

        var userInfo = parsedUrl.UserInfo;
        if (userInfo.Length > 0)
        {
            builder.Append(userInfo);
            builder.Append('@');
        }

        builder.Append(parsedUrl.Host);
        builder.Append(port);
        builder.Append(parsedUrl.AbsolutePath);
        builder.Append(parsedUrl.Query);
        builder.Append(parsedUrl.Fragment);
        return builder.ToString();
    }

    private static string AddPort(Uri parsedUrl)
    {
        if (parsedUrl.IsDefaultPort)
        {
            // No explicit port present, so add the scheme's standard port.
            return BuildUrlWithStandardPort(parsedUrl);
        }
        return parsedUrl.AbsoluteUri;
    }

    private static string RemovePort(Uri parsedUrl)
    {
        var builder = new UriBuilder(parsedUrl) { Port = -1 };
        return builder.Uri.AbsoluteUri;
    }

    private static string WithLegacyQuerystring(string url)
    {
        Uri parsedUrl;
        try
        {
            parsedUrl = new Uri(url, UriKind.Absolute);
        }
        catch (Exception)
        {
            return url;
        }

        var query = parsedUrl.Query;
        if (query.Length == 0)
        {
            return url;
        }

        // Strip the leading '?' before re-encoding each key/value pair with legacy
        // form-encoding (application/x-www-form-urlencoded), reversing percent-encoding
        // differences introduced by the URI parser.
        var trimmed = query[0] == '?' ? query.Substring(1) : query;
        var reEncoded = string.Join(
            "&",
            trimmed
                .Split('&')
                .Where(pair => pair.Length > 0)
                .Select(pair =>
                {
                    var separatorIndex = pair.IndexOf('=');
                    if (separatorIndex < 0)
                    {
                        var soleKey = Uri.UnescapeDataString(pair);
                        return LegacyFormEncode(soleKey);
                    }
                    var key = Uri.UnescapeDataString(pair.Substring(0, separatorIndex));
                    var value = Uri.UnescapeDataString(pair.Substring(separatorIndex + 1));
                    return LegacyFormEncode(key) + "=" + LegacyFormEncode(value);
                })
        );

        var prefix = url.Substring(0, url.Length - query.Length);
        return prefix + "?" + reEncoded;
    }

    /// <summary>
    /// Encode a string using legacy application/x-www-form-urlencoded rules (space as
    /// "+"), matching the query re-encoding Twilio's libraries perform.
    /// </summary>
    private static string LegacyFormEncode(string value)
    {
        var builder = new StringBuilder();
        var bytes = Encoding.UTF8.GetBytes(value);
        foreach (var b in bytes)
        {
            var c = (char)b;
            if (
                (c >= 'A' && c <= 'Z')
                || (c >= 'a' && c <= 'z')
                || (c >= '0' && c <= '9')
                || c == '-'
                || c == '_'
                || c == '.'
                || c == '*'
            )
            {
                builder.Append(c);
            }
            else if (c == ' ')
            {
                builder.Append('+');
            }
            else
            {
                builder.Append('%');
                builder.Append(((int)b).ToString("X2"));
            }
        }
        return builder.ToString();
    }
}
