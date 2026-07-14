# frozen_string_literal: true

require "base64"
require "openssl"

module Seed
  module Internal
    # Utilities for verifying webhook signatures using the Ruby standard library.
    #
    # @api private
    module WebhookSignature
      HMAC_DIGESTS = {
        "sha1" => "SHA1",
        "sha256" => "SHA256",
        "sha384" => "SHA384",
        "sha512" => "SHA512"
      }.freeze

      module_function

      # Compute the HMAC signature of a payload using the given secret, algorithm, and encoding.
      #
      # @param payload [String]
      # @param secret [String]
      # @param algorithm [String]
      # @param encoding [String]
      # @return [String]
      def compute_hmac_signature(payload:, secret:, algorithm:, encoding:)
        digest_name = HMAC_DIGESTS.fetch(algorithm) do
          raise ArgumentError, "Unsupported HMAC algorithm: #{algorithm}"
        end
        mac = OpenSSL::HMAC.digest(OpenSSL::Digest.new(digest_name), secret, payload)
        encoding == "hex" ? mac.unpack1("H*") : Base64.strict_encode64(mac)
      end

      # Compare two strings in constant time to avoid leaking information through timing.
      #
      # @param known [String]
      # @param given [String]
      # @return [Boolean]
      def timing_safe_equal(known, given)
        if OpenSSL.respond_to?(:fixed_length_secure_compare)
          known.bytesize == given.bytesize && OpenSSL.fixed_length_secure_compare(known, given)
        else
          constant_time_equal?(known, given)
        end
      end

      # Fallback constant-time comparison for runtimes that do not expose
      # OpenSSL.fixed_length_secure_compare.
      #
      # @param known [String]
      # @param given [String]
      # @return [Boolean]
      def constant_time_equal?(known, given)
        known_bytes = known.bytes
        given_bytes = given.bytes
        return false if known_bytes.length != given_bytes.length

        result = 0
        known_bytes.each_with_index do |byte, index|
          result |= byte ^ given_bytes[index]
        end
        result.zero?
      end
    end
  end
end
