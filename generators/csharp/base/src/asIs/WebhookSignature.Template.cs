using global::System;
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
#if NET8_0_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        return CryptographicOperations.FixedTimeEquals(bytesA, bytesB);
#else
        // FixedTimeEquals is unavailable on net462/netstandard2.0, so fall back to a
        // portable constant-time comparison over the compared bytes.
        if (bytesA.Length != bytesB.Length)
        {
            return false;
        }

        var result = 0;
        for (var i = 0; i < bytesA.Length; i++)
        {
            result |= bytesA[i] ^ bytesB[i];
        }
        return result == 0;
#endif
    }
}
