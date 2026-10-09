# frozen_string_literal: true

require "base64"
require "digest/sha1"
require "digest/sha2"
require "uri"

module <%= gem_namespace %>
  module Internal
    # Utilities for verifying a separately transmitted hash of a raw webhook body.
    #
    # @api private
    module WebhookBodyHash
      HASH_DIGESTS = {
        "sha1" => Digest::SHA1,
        "sha256" => Digest::SHA256,
        "sha384" => Digest::SHA384,
        "sha512" => Digest::SHA512
      }.freeze

      module_function

      # Compute an unkeyed digest of a payload using the given algorithm and encoding.
      #
      # @param payload [String]
      # @param algorithm [String]
      # @param encoding [String]
      # @return [String]
      def compute_hash(payload:, algorithm:, encoding:)
        digest = HASH_DIGESTS.fetch(algorithm) do
          raise ArgumentError, "Unsupported hash algorithm: #{algorithm}"
        end

        case encoding
        when "hex"
          digest.hexdigest(payload)
        when "base64"
          Base64.strict_encode64(digest.digest(payload))
        else
          raise ArgumentError, "Unsupported hash encoding: #{encoding}"
        end
      end

      # Read a query parameter without modifying the URL.
      #
      # @param url [String]
      # @param name [String]
      # @return [String, nil]
      def get_query_parameter(url, name)
        query = URI.parse(url).query
        return nil if query.nil?

        URI.decode_www_form(query).find { |key, _value| key == name }&.last
      rescue URI::InvalidURIError, ArgumentError
        nil
      end
    end
  end
end
