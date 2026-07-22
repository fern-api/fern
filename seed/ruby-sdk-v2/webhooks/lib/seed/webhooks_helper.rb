# frozen_string_literal: true

module Seed
  # Verify an HMAC webhook signature.
  #
  # Extract the signature from the "x-webhook-signature" header and pass it as the signature_header parameter.
  # Extract the timestamp from the "x-webhook-timestamp" header and pass it as the timestamp_header parameter.
  class WebhooksHelper
    TIMESTAMP_TOLERANCE_SECONDS = 300

    SIGNATURE_PREFIX = "sha256="

    # @param request_body [String]
    # @param signature_header [String]
    # @param signature_key [String]
    # @param timestamp_header [String]
    #
    # @return [Boolean]
    def self.verify_signature(request_body:, signature_header:, signature_key:, timestamp_header:)
      return false if request_body.nil? || signature_header.nil? || signature_header.empty? || signature_key.nil? || signature_key.empty?

      return false if timestamp_header.nil? || timestamp_header == ""

      begin
        timestamp_value = Integer(timestamp_header, 10)
      rescue ArgumentError, TypeError
        return false
      end
      timestamp_ms = timestamp_value * 1000

      now_ms = Time.now.to_f * 1000
      return false if (now_ms - timestamp_ms).abs > TIMESTAMP_TOLERANCE_SECONDS * 1000

      signature = signature_header.start_with?(SIGNATURE_PREFIX) ? signature_header[SIGNATURE_PREFIX.length..] : signature_header

      payload = [timestamp_header, request_body].join(".")

      expected = Internal::WebhookSignature.compute_hmac_signature(
        payload: payload,
        secret: signature_key,
        algorithm: "sha256",
        encoding: "hex"
      )

      Internal::WebhookSignature.timing_safe_equal(signature, expected)
    end
  end
end
