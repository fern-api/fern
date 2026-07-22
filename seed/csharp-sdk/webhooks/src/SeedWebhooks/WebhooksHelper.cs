using SeedWebhooks.Core;

namespace SeedWebhooks;

/// <summary>
/// Utilities for verifying the signatures of incoming webhook requests.
/// </summary>
public static class WebhooksHelper
{
    private const long TimestampToleranceSeconds = 300;

    private const string SignaturePrefix = "sha256=";

    public static bool VerifySignature(
        string requestBody,
        string signatureHeader,
        string signatureKey,
        string timestampHeader
    )
    {
        if (requestBody == null || signatureHeader == null || signatureKey == null)
        {
            return false;
        }

        if (string.IsNullOrEmpty(timestampHeader))
        {
            return false;
        }

        if (!long.TryParse(timestampHeader, out var timestampValue))
        {
            return false;
        }
        var timestampMs = timestampValue * 1000L;
        if (
            global::System.Math.Abs(
                global::System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - timestampMs
            )
            > TimestampToleranceSeconds * 1000L
        )
        {
            return false;
        }

        var sig = signatureHeader.StartsWith(
            SignaturePrefix,
            global::System.StringComparison.Ordinal
        )
            ? signatureHeader.Substring(SignaturePrefix.Length)
            : signatureHeader;

        var payload = string.Join(".", timestampHeader, requestBody);

        var expected = WebhookSignature.ComputeHmacSignature(
            payload,
            signatureKey,
            "sha256",
            "hex"
        );

        return WebhookSignature.TimingSafeEqual(sig, expected);
    }
}
