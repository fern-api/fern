# frozen_string_literal: true

module Seed
  # Verify an HMAC webhook signature.
  #
  # Extract the signature from the "x-twilio-signature" header and pass it as the signature_header parameter.
  # The raw request body is verified against a separately transmitted hash. Pass the exact raw body as request_body and
  # the verbatim notification URL as notification_url.
  class SmsStatusWebhooksHelper
    # @param request_body [String]
    # @param signature_header [String]
    # @param signature_key [String]
    # @param notification_url [String]
    #
    # @return [Boolean]
    def self.verify_signature(request_body:, signature_header:, signature_key:, notification_url:)
      raise ArgumentError, "Missing required parameters for webhook signature verification" if request_body.nil? || signature_header.nil? || signature_key.nil?

      payload = notification_url

      expected_body_hash = Internal::WebhookBodyHash.compute_hash(
        payload: request_body,
        algorithm: "sha256",
        encoding: "hex"
      )
      transmitted_body_hash = Internal::WebhookBodyHash.get_query_parameter(notification_url, "bodySHA256")
      return false if transmitted_body_hash.nil? || !Internal::WebhookSignature.timing_safe_equal(expected_body_hash, transmitted_body_hash)

      expected = Internal::WebhookSignature.compute_hmac_signature(
        payload: payload,
        secret: signature_key,
        algorithm: "sha1",
        encoding: "base64"
      )

      Internal::WebhookSignature.timing_safe_equal(signature_header, expected)
    end
  end
end
