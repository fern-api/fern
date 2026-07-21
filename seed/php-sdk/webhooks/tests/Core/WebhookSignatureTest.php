<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\WebhookSignature;

class WebhookSignatureTest extends TestCase
{
    public function testComputeHashSha256Hex(): void
    {
        $this->assertSame(
            '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
            WebhookSignature::computeHash('hello', 'sha256', 'hex')
        );
    }

    public function testComputeHashSha1Hex(): void
    {
        $this->assertSame(
            'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
            WebhookSignature::computeHash('hello', 'sha1', 'hex')
        );
    }

    public function testComputeHashMatchesTwilioBodySha256Scheme(): void
    {
        $body = '{"messageSid":"SM123","status":"delivered"}';
        $this->assertSame(
            '8fde9e5e9275489edf302e1501dd8218dc56af6125dfb404c8e40751e5fea277',
            WebhookSignature::computeHash($body, 'sha256', 'hex')
        );
    }

    public function testComputeHashBase64(): void
    {
        $body = '{"messageSid":"SM123","status":"delivered"}';
        $this->assertSame(
            'j96eXpJ1SJ7fMC4VAd2CGNxWr2El37QEyOQHUeX+onc=',
            WebhookSignature::computeHash($body, 'sha256', 'base64')
        );
    }

    public function testComputeHashSha512HexLength(): void
    {
        $this->assertSame(128, strlen(WebhookSignature::computeHash('hello', 'sha512', 'hex')));
    }

    public function testComputeHashIsUnkeyedAndBodySensitive(): void
    {
        $original = WebhookSignature::computeHash('original-body', 'sha256', 'hex');
        $tampered = WebhookSignature::computeHash('tampered-body', 'sha256', 'hex');
        $this->assertNotSame($original, $tampered);
    }

    public function testGetWebhookQueryParameterExtractsValue(): void
    {
        $url = 'https://example.com/webhooks/sms?bodySHA256=abc123';
        $this->assertSame('abc123', WebhookSignature::getWebhookQueryParameter($url, 'bodySHA256'));
    }

    public function testGetWebhookQueryParameterReturnsNullWhenAbsent(): void
    {
        $url = 'https://example.com/webhooks/sms?foo=bar';
        $this->assertNull(WebhookSignature::getWebhookQueryParameter($url, 'bodySHA256'));
    }

    public function testGetWebhookQueryParameterReturnsNullForUnparseableUrl(): void
    {
        $this->assertNull(WebhookSignature::getWebhookQueryParameter('://not a url', 'bodySHA256'));
    }

    public function testGetWebhookQueryParameterIsReadOnlyAndDoesNotReorder(): void
    {
        // The verbatim URL (including param order) is what the outer HMAC signs, so
        // extraction must not mutate or reorder the query string.
        $url = 'https://example.com/hook?a=1&bodySHA256=deadbeef&z=2';
        $this->assertSame('deadbeef', WebhookSignature::getWebhookQueryParameter($url, 'bodySHA256'));
    }

    public function testValidBodyAndQueryHashVerifies(): void
    {
        [$body, $signature, $secret, $url] = $this->buildValidInputs();
        $this->assertTrue($this->verify($body, $signature, $secret, $url));
    }

    public function testTamperedRawBodyFails(): void
    {
        [$body, $signature, $secret, $url] = $this->buildValidInputs();
        $tamperedBody = '{"messageSid":"SM123","status":"failed"}';
        $this->assertNotSame($body, $tamperedBody);
        $this->assertFalse($this->verify($tamperedBody, $signature, $secret, $url));
    }

    public function testTamperedQueryHashFails(): void
    {
        [$body, $signature, $secret] = $this->buildValidInputs();
        $tamperedUrl = 'https://example.com/webhooks/sms?bodySHA256=' . str_repeat('0', 64);
        $this->assertFalse($this->verify($body, $signature, $secret, $tamperedUrl));
    }

    public function testTamperedHmacSignatureFails(): void
    {
        [$body, , $secret, $url] = $this->buildValidInputs();
        $tamperedSignature = base64_encode('not-the-real-signature');
        $this->assertFalse($this->verify($body, $tamperedSignature, $secret, $url));
    }

    public function testWrongSecretFails(): void
    {
        [$body, $signature, , $url] = $this->buildValidInputs();
        $this->assertFalse($this->verify($body, $signature, 'wrong-secret', $url));
    }

    public function testNotificationUrlIsSignedVerbatim(): void
    {
        // The outer HMAC signs the notification URL verbatim; a URL whose query
        // parameters are reordered is a different string and must not validate,
        // even though it carries the same body hash.
        $body = '{"messageSid":"SM123","status":"delivered"}';
        $bodyHash = WebhookSignature::computeHash($body, 'sha256', 'hex');
        $secret = 'twilio-secret';

        $url = 'https://example.com/hook?bodySHA256=' . $bodyHash . '&extra=1';
        $reorderedUrl = 'https://example.com/hook?extra=1&bodySHA256=' . $bodyHash;

        $signature = base64_encode(hash_hmac('sha1', $url, $secret, true));

        $this->assertTrue($this->verify($body, $signature, $secret, $url));
        $this->assertFalse($this->verify($body, $signature, $secret, $reorderedUrl));
    }

    public function testNotificationUrlCandidatesIncludesCallerUrl(): void
    {
        $candidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=1', true, true);
        // The caller's exact URL is always the first candidate.
        $this->assertSame('https://example.com/hook?a=1', $candidates[0]);
    }

    public function testNotificationUrlCandidatesAddsStandardPortAndNoPortForms(): void
    {
        $candidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook', true, false);
        $this->assertContains('https://example.com:443/hook', $candidates);
        $this->assertContains('https://example.com/hook', $candidates);

        $httpCandidates = WebhookSignature::notificationUrlCandidates('http://example.com/hook', true, false);
        $this->assertContains('http://example.com:80/hook', $httpCandidates);
    }

    public function testNotificationUrlCandidatesRemovesExistingPort(): void
    {
        $candidates = WebhookSignature::notificationUrlCandidates('https://example.com:8443/hook', true, false);
        $this->assertContains('https://example.com/hook', $candidates);
        $this->assertContains('https://example.com:8443/hook', $candidates);
    }

    public function testNotificationUrlCandidatesReencodesLegacyQuery(): void
    {
        $candidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=b%20c', true, true);
        // Legacy form-encoding renders a space as '+'.
        $this->assertContains('https://example.com/hook?a=b+c', $candidates);
    }

    public function testNotificationUrlCandidatesWithoutPortVariantsReturnsOnlyCallerUrl(): void
    {
        $candidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=1', false, false);
        $this->assertSame(['https://example.com/hook?a=1'], $candidates);
    }

    public function testNotificationUrlCandidatesFallsBackForUnparseableUrl(): void
    {
        // An unparseable URL never throws and yields the caller's URL unchanged.
        $this->assertSame(['not-a-url'], WebhookSignature::notificationUrlCandidates('not-a-url', true, true));
        $this->assertSame([], WebhookSignature::notificationUrlCandidates(null, true, true));
    }

    /**
     * @return array{0: string, 1: string, 2: string, 3: string}
     */
    private function buildValidInputs(): array
    {
        $body = '{"messageSid":"SM123","status":"delivered"}';
        $secret = 'twilio-secret';
        $bodyHash = WebhookSignature::computeHash($body, 'sha256', 'hex');
        $url = 'https://example.com/webhooks/sms?bodySHA256=' . $bodyHash;
        $signature = base64_encode(hash_hmac('sha1', $url, $secret, true));

        return [$body, $signature, $secret, $url];
    }

    /**
     * Mirrors the generated two-step verify helper: recompute the body hash and
     * compare it to the value transmitted in the notification URL (failing closed),
     * then verify the outer HMAC over the verbatim notification URL.
     */
    private function verify(string $requestBody, string $signatureHeader, string $signatureKey, string $notificationUrl): bool
    {
        $signature = $signatureHeader;

        $payload = implode('', [$notificationUrl]);

        $expectedBodyHash = WebhookSignature::computeHash($requestBody, 'sha256', 'hex');
        $transmittedBodyHash = WebhookSignature::getWebhookQueryParameter($notificationUrl, 'bodySHA256');
        if ($transmittedBodyHash === null || !WebhookSignature::timingSafeEqual($transmittedBodyHash, $expectedBodyHash)) {
            return false;
        }

        $expected = WebhookSignature::computeHmacSignature(
            payload: $payload,
            secret: $signatureKey,
            algorithm: 'sha1',
            encoding: 'base64',
        );

        return WebhookSignature::timingSafeEqual($signature, $expected);
    }
}
