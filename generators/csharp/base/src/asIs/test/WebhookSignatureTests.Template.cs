using NUnit.Framework;
using <%= namespace%>.Core;

namespace <%= testNamespace%>.Core;

[TestFixture]
public class WebhookSignatureTests
{
    [Test]
    public void ComputeHash_Sha256_Hex()
    {
        // Known vector: SHA-256("abc").
        var result = WebhookSignature.ComputeHash("abc", "sha256", "hex");
        Assert.That(
            result,
            Is.EqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
        );
    }

    [Test]
    public void ComputeHash_Sha256_Base64()
    {
        var result = WebhookSignature.ComputeHash("abc", "sha256", "base64");
        Assert.That(result, Is.EqualTo("ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0="));
    }

    [Test]
    public void ComputeHash_Sha1_Hex()
    {
        // Known vector: SHA-1("abc").
        var result = WebhookSignature.ComputeHash("abc", "sha1", "hex");
        Assert.That(result, Is.EqualTo("a9993e364706816aba3e25717850c26c9cd0d89d"));
    }

    [Test]
    public void GetQueryParameter_ReturnsValue()
    {
        var url = "https://example.com/webhooks/sms?bodySHA256=abc123&other=ignored";
        Assert.That(WebhookSignature.GetQueryParameter(url, "bodySHA256"), Is.EqualTo("abc123"));
    }

    [Test]
    public void GetQueryParameter_ReturnsSecondParameter()
    {
        var url = "https://example.com/webhooks/sms?other=ignored&bodySHA256=abc123";
        Assert.That(WebhookSignature.GetQueryParameter(url, "bodySHA256"), Is.EqualTo("abc123"));
    }

    [Test]
    public void GetQueryParameter_MissingParameter_ReturnsNull()
    {
        var url = "https://example.com/webhooks/sms?other=ignored";
        Assert.That(WebhookSignature.GetQueryParameter(url, "bodySHA256"), Is.Null);
    }

    [Test]
    public void GetQueryParameter_NoQuery_ReturnsNull()
    {
        var url = "https://example.com/webhooks/sms";
        Assert.That(WebhookSignature.GetQueryParameter(url, "bodySHA256"), Is.Null);
    }

    [Test]
    public void GetQueryParameter_UnparseableUrl_ReturnsNull()
    {
        Assert.That(WebhookSignature.GetQueryParameter("not a url", "bodySHA256"), Is.Null);
    }

    [Test]
    public void GetQueryParameter_UrlEncodedValue_IsDecoded()
    {
        var url = "https://example.com/webhooks/sms?bodySHA256=a%2Bb";
        Assert.That(WebhookSignature.GetQueryParameter(url, "bodySHA256"), Is.EqualTo("a+b"));
    }

    [Test]
    public void TimingSafeEqual_Behavior()
    {
        Assert.That(WebhookSignature.TimingSafeEqual("abc", "abc"), Is.True);
        Assert.That(WebhookSignature.TimingSafeEqual("abc", "abd"), Is.False);
        Assert.That(WebhookSignature.TimingSafeEqual("abc", "abcd"), Is.False);
    }

    // The following tests exercise the full two-step body-hash binding verification
    // (Twilio-style): the raw body is verified against a SHA-256 hash carried in the
    // notification URL's query string, and the HMAC-SHA1 signature is computed over the
    // verbatim notification URL. Both checks must pass.

    private const string RawBody = "{\"MessageSid\":\"SM123\",\"MessageStatus\":\"delivered\"}";
    private const string Secret = "my-webhook-secret";

    private static string BuildNotificationUrl(string bodyHash)
    {
        return $"https://example.com/webhooks/sms?bodySHA256={bodyHash}";
    }

    private static bool VerifyTwilioStyle(
        string requestBody,
        string notificationUrl,
        string signature,
        string secret
    )
    {
        var expectedBodyHash = WebhookSignature.ComputeHash(requestBody, "sha256", "hex");
        var transmittedBodyHash = WebhookSignature.GetQueryParameter(notificationUrl, "bodySHA256");
        if (
            transmittedBodyHash == null
            || !WebhookSignature.TimingSafeEqual(expectedBodyHash, transmittedBodyHash)
        )
        {
            return false;
        }

        var expected = WebhookSignature.ComputeHmacSignature(notificationUrl, secret, "sha1", "base64");
        return WebhookSignature.TimingSafeEqual(signature, expected);
    }

    [Test]
    public void BodyHashBinding_ValidRequest_ReturnsTrue()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var url = BuildNotificationUrl(bodyHash);
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        Assert.That(VerifyTwilioStyle(RawBody, url, signature, Secret), Is.True);
    }

    [Test]
    public void BodyHashBinding_TamperedBody_ReturnsFalse()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var url = BuildNotificationUrl(bodyHash);
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        var tamperedBody = "{\"MessageSid\":\"SM123\",\"MessageStatus\":\"failed\"}";
        Assert.That(VerifyTwilioStyle(tamperedBody, url, signature, Secret), Is.False);
    }

    [Test]
    public void BodyHashBinding_TamperedQueryHash_ReturnsFalse()
    {
        var url = BuildNotificationUrl("0000000000000000000000000000000000000000000000000000000000000000");
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        // The HMAC still matches the (tampered) URL, but the body hash does not.
        Assert.That(VerifyTwilioStyle(RawBody, url, signature, Secret), Is.False);
    }

    [Test]
    public void BodyHashBinding_TamperedSignature_ReturnsFalse()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var url = BuildNotificationUrl(bodyHash);

        Assert.That(VerifyTwilioStyle(RawBody, url, "not-a-valid-signature", Secret), Is.False);
    }

    [Test]
    public void BodyHashBinding_WrongSecret_ReturnsFalse()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var url = BuildNotificationUrl(bodyHash);
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        Assert.That(VerifyTwilioStyle(RawBody, url, signature, "different-secret"), Is.False);
    }

    [Test]
    public void BodyHashBinding_MissingQueryParameter_ReturnsFalse()
    {
        var url = "https://example.com/webhooks/sms";
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        Assert.That(VerifyTwilioStyle(RawBody, url, signature, Secret), Is.False);
    }

    [Test]
    public void BodyHashBinding_NotificationUrlUsedVerbatim()
    {
        // The URL carries query parameters in a non-sorted order; verification must sign
        // the URL exactly as received without reordering or normalizing it.
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var url = $"https://example.com/webhooks/sms?zeta=1&bodySHA256={bodyHash}&alpha=2";
        var signature = WebhookSignature.ComputeHmacSignature(url, Secret, "sha1", "base64");

        Assert.That(VerifyTwilioStyle(RawBody, url, signature, Secret), Is.True);

        // A reordered URL produces a different HMAC and must not verify.
        var reordered = $"https://example.com/webhooks/sms?alpha=2&bodySHA256={bodyHash}&zeta=1";
        Assert.That(VerifyTwilioStyle(RawBody, reordered, signature, Secret), Is.False);
    }

    // The following tests exercise the multi-value form-parameter flattening: keys are
    // sorted, per-key values are deduped and sorted, and `key + value` pairs are
    // concatenated with no separator (mirroring twilio-node's `toFormUrlEncodedParam`).

    private static string FlattenFormParams(
        global::System.Collections.Generic.IReadOnlyDictionary<string, object?> requestBody
    )
    {
        var builder = new global::System.Text.StringBuilder();
        foreach (
            var key in global::System.Linq.Enumerable.OrderBy(
                requestBody.Keys,
                k => k,
                global::System.StringComparer.Ordinal
            )
        )
        {
            var value = requestBody[key];
            var values = new global::System.Collections.Generic.SortedSet<string>(
                global::System.StringComparer.Ordinal
            );
            if (value is global::System.Collections.Generic.IEnumerable<string> stringEnumerable)
            {
                foreach (var item in stringEnumerable)
                {
                    values.Add(item);
                }
            }
            else if (value is string single)
            {
                values.Add(single);
            }

            foreach (var sortedValue in values)
            {
                builder.Append(key).Append(sortedValue);
            }
        }

        return builder.ToString();
    }

    [Test]
    public void FormParams_SingleValue_SortsKeys()
    {
        var body = new global::System.Collections.Generic.Dictionary<string, object?>
        {
            { "Zeta", "1" },
            { "Alpha", "2" },
        };
        Assert.That(FlattenFormParams(body), Is.EqualTo("Alpha2Zeta1"));
    }

    [Test]
    public void FormParams_RepeatedValues_AreDeduped()
    {
        var body = new global::System.Collections.Generic.Dictionary<string, object?>
        {
            {
                "Key",
                new global::System.Collections.Generic.List<string> { "b", "b", "a" }
            },
        };
        // Values are deduped and sorted: a, b -> "KeyaKeyb".
        Assert.That(FlattenFormParams(body), Is.EqualTo("KeyaKeyb"));
    }

    [Test]
    public void FormParams_KeysAndValuesSortedIndependently()
    {
        var body = new global::System.Collections.Generic.Dictionary<string, object?>
        {
            {
                "B",
                new global::System.Collections.Generic.List<string> { "2", "1" }
            },
            { "A", "z" },
        };
        Assert.That(FlattenFormParams(body), Is.EqualTo("AzB1B2"));
    }

    // The following tests exercise the notification-URL candidate normalization used for
    // the any-match verification path.

    [Test]
    public void NotificationUrlCandidates_PortVariants_AddsStandardAndNoPort()
    {
        var candidates = WebhookSignature.NotificationUrlCandidates(
            "https://example.com/webhooks/sms",
            portVariants: true,
            legacyQueryEncoding: false
        );

        // The caller URL is always present, plus the no-port and :443 forms.
        Assert.That(candidates, Contains.Item("https://example.com/webhooks/sms"));
        Assert.That(candidates, Contains.Item("https://example.com:443/webhooks/sms"));
    }

    [Test]
    public void NotificationUrlCandidates_HttpUsesPort80()
    {
        var candidates = WebhookSignature.NotificationUrlCandidates(
            "http://example.com/webhooks/sms",
            portVariants: true,
            legacyQueryEncoding: false
        );

        Assert.That(candidates, Contains.Item("http://example.com:80/webhooks/sms"));
    }

    [Test]
    public void NotificationUrlCandidates_AsIsWhenDisabled()
    {
        var candidates = WebhookSignature.NotificationUrlCandidates(
            "https://example.com:8443/webhooks/sms",
            portVariants: false,
            legacyQueryEncoding: false
        );

        Assert.That(candidates, Is.EqualTo(new[] { "https://example.com:8443/webhooks/sms" }));
    }

    [Test]
    public void NotificationUrlCandidates_AlwaysIncludesCallerUrlFirst()
    {
        var url = "https://example.com/webhooks/sms?bodySHA256=abc";
        var candidates = WebhookSignature.NotificationUrlCandidates(
            url,
            portVariants: true,
            legacyQueryEncoding: true
        );

        Assert.That(global::System.Linq.Enumerable.First(candidates), Is.EqualTo(url));
    }

    [Test]
    public void NotificationUrlCandidates_DedupesPreservingOrder()
    {
        // A URL already carrying the standard port collapses the as-is and add-port forms.
        var candidates = WebhookSignature.NotificationUrlCandidates(
            "https://example.com:443/webhooks/sms",
            portVariants: true,
            legacyQueryEncoding: false
        );

        Assert.That(
            candidates,
            Is.EqualTo(
                global::System.Linq.Enumerable.ToArray(
                    global::System.Linq.Enumerable.Distinct(candidates)
                )
            )
        );
    }

    [Test]
    public void NotificationUrlCandidates_UnparseableUrl_ReturnsSingleton()
    {
        var candidates = WebhookSignature.NotificationUrlCandidates(
            "not a url",
            portVariants: true,
            legacyQueryEncoding: true
        );

        Assert.That(candidates, Is.EqualTo(new[] { "not a url" }));
    }

    // End-to-end any-match verification: the SmsStatusWebhooksHelper signs the URL only on
    // the JSON path (body-hash query parameter present). A signature computed over ANY
    // candidate form of the URL must verify.

    [Test]
    public void AnyMatch_SignatureOverNoPortForm_Verifies()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        // The caller receives a :443 URL, but the provider signed the no-port form.
        var receivedUrl = $"https://example.com:443/webhooks/sms?bodySHA256={bodyHash}";
        var signedUrl = $"https://example.com/webhooks/sms?bodySHA256={bodyHash}";
        var signature = WebhookSignature.ComputeHmacSignature(signedUrl, Secret, "sha1", "base64");

        var verified = VerifyAnyMatch(receivedUrl, signature, Secret);
        Assert.That(verified, Is.True);
    }

    [Test]
    public void AnyMatch_WrongSecret_ReturnsFalse()
    {
        var bodyHash = WebhookSignature.ComputeHash(RawBody, "sha256", "hex");
        var receivedUrl = $"https://example.com/webhooks/sms?bodySHA256={bodyHash}";
        var signedUrl = $"https://example.com:443/webhooks/sms?bodySHA256={bodyHash}";
        var signature = WebhookSignature.ComputeHmacSignature(signedUrl, Secret, "sha1", "base64");

        Assert.That(VerifyAnyMatch(receivedUrl, signature, "different-secret"), Is.False);
    }

    private static bool VerifyAnyMatch(string notificationUrl, string signature, string secret)
    {
        var candidates = WebhookSignature.NotificationUrlCandidates(
            notificationUrl,
            portVariants: true,
            legacyQueryEncoding: true
        );
        foreach (var candidate in candidates)
        {
            var expected = WebhookSignature.ComputeHmacSignature(candidate, secret, "sha1", "base64");
            if (WebhookSignature.TimingSafeEqual(signature, expected))
            {
                return true;
            }
        }

        return false;
    }
}
