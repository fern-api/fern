using global::System;
using global::System.Security.Cryptography;
using global::System.Text;

namespace SeedWebhooks.Core;

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
