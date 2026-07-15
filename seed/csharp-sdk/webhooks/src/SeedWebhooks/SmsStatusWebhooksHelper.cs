using SeedWebhooks.Core;

namespace SeedWebhooks;

/// <summary>
/// Utilities for verifying the signatures of incoming webhook requests.
/// </summary>
public static class SmsStatusWebhooksHelper
{
    public static bool VerifySignature(
        string requestBody,
        string signatureHeader,
        string signatureKey,
        string notificationUrl
    )
    {
        if (requestBody == null || signatureHeader == null || signatureKey == null)
        {
            throw new global::System.ArgumentException(
                "Missing required parameters for webhook signature verification"
            );
        }

        var expectedBodyHash = WebhookSignature.ComputeHash(requestBody, "sha256", "hex");
        var transmittedBodyHash = WebhookSignature.GetQueryParameter(notificationUrl, "bodySHA256");
        if (
            transmittedBodyHash == null
            || !WebhookSignature.TimingSafeEqual(expectedBodyHash, transmittedBodyHash)
        )
        {
            return false;
        }

        var payload = notificationUrl;

        var expected = WebhookSignature.ComputeHmacSignature(
            payload,
            signatureKey,
            "sha1",
            "base64"
        );

        return WebhookSignature.TimingSafeEqual(signatureHeader, expected);
    }
}
