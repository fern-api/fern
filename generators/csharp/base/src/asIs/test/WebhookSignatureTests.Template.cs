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
}
