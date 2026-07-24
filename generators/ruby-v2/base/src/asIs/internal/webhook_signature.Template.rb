# frozen_string_literal: true

require "base64"
require "openssl"
require "uri"

module <%= gem_namespace %>
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

      STANDARD_PORTS = {
        "https" => 443,
        "http" => 80
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

      # Build the list of normalized notification-URL forms to verify a webhook signature
      # against. Some providers (e.g. Twilio) are inconsistent about whether the URL they
      # signed carried a port and how its query string was encoded, so a signature is
      # accepted if it matches the computation over ANY of these candidates.
      #
      # Mirrors twilio's addPort / removePort / buildUrlWithStandardPort /
      # withLegacyQuerystring. Always includes at least the caller-supplied URL and never
      # raises: an unparseable URL yields [url].
      #
      # @param url [String]
      # @param port_variants [Boolean]
      # @param legacy_query_encoding [Boolean]
      # @return [Array<String>]
      def notification_url_candidates(url, port_variants:, legacy_query_encoding:)
        parsed = URI.parse(url)

        port_forms = port_variants ? [remove_port(parsed), add_port(url, parsed)] : [url]

        # A Hash preserves insertion order while collapsing forms that coincide (e.g. a URL
        # that already carries a standard port, or a query-less URL under legacy encoding).
        candidates = {}
        candidates[url] = true
        port_forms.each { |form| candidates[form] = true }
        port_forms.each { |form| candidates[with_legacy_querystring(form)] = true } if legacy_query_encoding
        candidates.keys
      rescue URI::InvalidURIError
        [url]
      end

      # Reassemble a URL from its parsed components, substituting the given port. A nil
      # port omits the port entirely. The components are emitted in order so the result is
      # byte-comparable to the URL the provider signed. URI::HTTP#to_s cannot be used here
      # because it drops a port equal to the scheme default.
      #
      # @param parsed [URI::Generic]
      # @param port [Integer, String, nil]
      # @return [String]
      def reassemble_url(parsed, port)
        url = +""
        url << "#{parsed.scheme}://" unless parsed.scheme.nil?
        url << "#{parsed.userinfo}@" unless parsed.userinfo.nil? || parsed.userinfo.empty?
        url << parsed.host unless parsed.host.nil?
        url << ":#{port}" unless port.nil?
        url << parsed.path unless parsed.path.nil?
        url << "?#{parsed.query}" unless parsed.query.nil?
        url << "##{parsed.fragment}" unless parsed.fragment.nil?
        url
      end

      # Reassemble a URL with the scheme's standard port (:443 for https, :80 for http).
      #
      # @param parsed [URI::Generic]
      # @return [String]
      def build_url_with_standard_port(parsed)
        reassemble_url(parsed, STANDARD_PORTS.fetch(parsed.scheme&.downcase, nil))
      end

      # Add the scheme's standard port when the URL does not already carry an explicit one,
      # otherwise preserve the explicit port verbatim.
      #
      # @param url [String]
      # @param parsed [URI::Generic]
      # @return [String]
      def add_port(url, parsed)
        explicit = explicit_port(url)
        return build_url_with_standard_port(parsed) if explicit.nil?

        reassemble_url(parsed, explicit)
      end

      # Remove any explicit port from the URL.
      #
      # @param parsed [URI::Generic]
      # @return [String]
      def remove_port(parsed)
        reassemble_url(parsed, nil)
      end

      # Re-encode the query with legacy form-encoding, reversing percent-encoding
      # differences introduced by URL parsing. Only the query component is rewritten so
      # the scheme, authority, and explicit port are preserved byte-for-byte.
      #
      # @param url [String]
      # @return [String]
      def with_legacy_querystring(url)
        parsed = URI.parse(url)
        return url if parsed.query.nil? || parsed.query.empty?

        requoted = URI.encode_www_form(URI.decode_www_form(parsed.query))
        prefix, _separator, rest = url.partition("?")
        fragment = rest.include?("#") ? "##{rest.split("#", 2).last}" : ""
        "#{prefix}?#{requoted}#{fragment}"
      rescue URI::InvalidURIError
        url
      end

      # Return the explicit port from the raw URL string, or nil when absent. URI::HTTP
      # fills in a default port, so the parsed object cannot answer this on its own;
      # inspect the raw authority instead.
      #
      # @param url [String]
      # @return [String, nil]
      def explicit_port(url)
        authority = url[%r{\A[^:/?#]+://([^/?#]*)}, 1]
        return nil if authority.nil?

        host_and_port = authority.split("@", 2).last
        host_and_port&.[](/:(\d+)\z/, 1)
      end
    end
  end
end
