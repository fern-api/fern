# frozen_string_literal: true

require "test_helper"

describe Seed::SmsStatusWebhooksHelper do
  it "verifies the raw body binding before the HMAC over the verbatim URL" do
    body = "{\"messageSid\":\"SM123\",\"status\":\"delivered\"}"
    secret = "supersecret"
    body_hash = Seed::Internal::WebhookBodyHash.compute_hash(
      payload: body,
      algorithm: "sha256",
      encoding: "hex"
    )
    body_hash_query = URI.encode_www_form([["bodySHA256", body_hash]])
    notification_url = "https://example.com/hooks/sms?z=last&#{body_hash_query}&a=first%20value&dup=1&dup=2"
    sign = ->(url) do
      Seed::Internal::WebhookSignature.compute_hmac_signature(
        payload: url,
        secret: secret,
        algorithm: "sha1",
        encoding: "base64"
      )
    end
    verify = ->(request_body:, url:, signature:, signature_key: secret) do
      Seed::SmsStatusWebhooksHelper.verify_signature(
        request_body: request_body,
        signature_header: signature,
        signature_key: signature_key,
        notification_url: url
      )
    end

    signature = sign.call(notification_url)

    assert verify.call(request_body: body, url: notification_url, signature: signature)

    refute verify.call(request_body: "#{body} ", url: notification_url, signature: signature)

    tampered_query = URI.encode_www_form([["bodySHA256", "#{body_hash}x"]])
    tampered_url = notification_url.sub(body_hash_query, tampered_query)

    refute verify.call(request_body: body, url: tampered_url, signature: sign.call(tampered_url))

    refute verify.call(request_body: body, url: notification_url, signature: "x#{signature[1..]}")
    refute verify.call(
      request_body: body,
      url: notification_url,
      signature: signature,
      signature_key: "wrong-secret"
    )

    url_without_hash = "https://example.com/hooks/sms?z=last"

    refute verify.call(request_body: body, url: url_without_hash, signature: sign.call(url_without_hash))
  end
end
