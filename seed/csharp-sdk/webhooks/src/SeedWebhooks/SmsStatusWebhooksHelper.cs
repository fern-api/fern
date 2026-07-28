using SeedWebhooks.Core;

namespace SeedWebhooks;

/// <summary>
/// Utilities for verifying the signatures of incoming webhook requests.
/// </summary>
public static class SmsStatusWebhooksHelper
{
    public static bool VerifySignature(
        object requestBody,
        string signatureHeader,
        string signatureKey,
        string notificationUrl
    )
    {
        if (requestBody == null || signatureHeader == null || signatureKey == null)
        {
            return false;
        }

        var transmittedBodyHash = WebhookSignature.GetQueryParameter(notificationUrl, "bodySHA256");
        if (transmittedBodyHash != null)
        {
            if (requestBody is not string rawBody)
            {
                return false;
            }
            var expectedBodyHash = WebhookSignature.ComputeHash(rawBody, "sha256", "hex");
            if (!WebhookSignature.TimingSafeEqual(expectedBodyHash, transmittedBodyHash))
            {
                return false;
            }
        }
        string bodyString;
        if (requestBody is string bodyStringRaw)
        {
            bodyString = bodyStringRaw;
        }
        else if (
            requestBody
            is global::System.Collections.Generic.IReadOnlyDictionary<string, object?> bodyStringMap
        )
        {
            var bodyStringBuilder = new global::System.Text.StringBuilder();
            foreach (
                var bodyStringKey in global::System.Linq.Enumerable.OrderBy(
                    bodyStringMap.Keys,
                    bodyStringItemKey => bodyStringItemKey,
                    global::System.StringComparer.Ordinal
                )
            )
            {
                var bodyStringValue = bodyStringMap[bodyStringKey];
                var bodyStringValues = new global::System.Collections.Generic.SortedSet<string>(
                    global::System.StringComparer.Ordinal
                );
                if (
                    bodyStringValue
                    is global::System.Collections.Generic.IEnumerable<string> bodyStringStringEnumerable
                )
                {
                    foreach (var bodyStringItem in bodyStringStringEnumerable)
                    {
                        bodyStringValues.Add(bodyStringItem);
                    }
                }
                else if (bodyStringValue is string bodyStringSingle)
                {
                    bodyStringValues.Add(bodyStringSingle);
                }
                else
                {
                    return false;
                }
                foreach (var bodyStringSortedValue in bodyStringValues)
                {
                    bodyStringBuilder.Append(bodyStringKey).Append(bodyStringSortedValue);
                }
            }
            bodyString = bodyStringBuilder.ToString();
        }
        else
        {
            return false;
        }
        var candidates = WebhookSignature.NotificationUrlCandidates(notificationUrl, true, true);
        foreach (var candidateUrl in candidates)
        {
            var payload =
                transmittedBodyHash != null
                    ? candidateUrl
                    : string.Join("", candidateUrl, bodyString);
            var expected = WebhookSignature.ComputeHmacSignature(
                payload,
                signatureKey,
                "sha1",
                "base64"
            );
            if (WebhookSignature.TimingSafeEqual(signatureHeader, expected))
            {
                return true;
            }
        }
        return false;
    }
}
