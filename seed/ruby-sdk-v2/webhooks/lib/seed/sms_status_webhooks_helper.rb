# frozen_string_literal: true

module Seed
  # Verify an HMAC webhook signature.
  #
  # Extract the signature from the "x-twilio-signature" header and pass it as the signature_header parameter.
  # The request_body parameter accepts either a raw string or a Hash of POST body parameters (each value a string or an
  # array of strings).
  # When a Hash is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as
  # key-value pairs before signing.
  # This helper verifies both classic form-encoded and JSON requests: it branches at runtime on whether the body-hash
  # query parameter is present on the notification URL.
  # For a JSON request the raw body is verified against that separately-transmitted hash and the signature is checked
  # over the notification URL only.
  # Pass the exact raw body as request_body and the verbatim notification URL as notification_url.
  # The signature is verified against several normalized forms of the notification URL, succeeding if any candidate
  # matches.
  class SmsStatusWebhooksHelper
    # @param request_body [String, Hash[String, String, Array[String]]]
    # @param signature_header [String]
    # @param signature_key [String]
    # @param notification_url [String]
    #
    # @return [Boolean]
    def self.verify_signature(request_body:, signature_header:, signature_key:, notification_url:) # rubocop:disable Naming/PredicateMethod
      return false if request_body.nil? || signature_header.nil? || signature_header.empty? || signature_key.nil? || signature_key.empty?

      transmitted_body_hash = Internal::WebhookBodyHash.get_query_parameter(notification_url, "bodySHA256")
      unless transmitted_body_hash.nil?
        expected_body_hash = Internal::WebhookBodyHash.compute_hash(
          payload: request_body,
          algorithm: "sha256",
          encoding: "hex"
        )
        return false unless Internal::WebhookSignature.timing_safe_equal(expected_body_hash, transmitted_body_hash)
      end
      body_string =
        if request_body.is_a?(::Hash)
          request_body.keys.sort.map do |key|
            value = request_body[key]
            values = value.is_a?(::Array) ? value : [value]
            values.uniq.sort.map { |v| "#{key}#{v}" }.join
          end.join
        else
          request_body
        end
      candidates = Internal::WebhookSignature.notification_url_candidates(
        notification_url,
        port_variants: true,
        legacy_query_encoding: true
      )
      candidates.each do |candidate_url|
        payload = transmitted_body_hash.nil? ? [candidate_url, body_string].join : candidate_url
        expected = Internal::WebhookSignature.compute_hmac_signature(
          payload: payload,
          secret: signature_key,
          algorithm: "sha1",
          encoding: "base64"
        )
        return true if Internal::WebhookSignature.timing_safe_equal(signature_header, expected)
      end

      false
    end
  end
end
