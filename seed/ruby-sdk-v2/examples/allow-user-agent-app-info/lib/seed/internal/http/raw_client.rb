# frozen_string_literal: true

module Seed
  module Internal
    module Http
      # @api private
      class RawClient
        # Default HTTP status codes that trigger a retry
        RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504, 521, 522, 524].freeze
        # Initial delay between retries in seconds
        INITIAL_RETRY_DELAY = 0.5
        # Maximum delay between retries in seconds
        MAX_RETRY_DELAY = 60.0
        # Jitter factor for randomizing retry delays (20%)
        JITTER_FACTOR = 0.2

        # @return [String] The base URL for requests
        attr_reader :base_url

        # @param base_url [String] The base url for the request.
        # @param max_retries [Integer] The number of times to retry a failed request, defaults to 2.
        # @param timeout [Float] The timeout for the request, defaults to 60.0 seconds.
        # @param headers [Hash] The headers for the request.
        # @param auth_provider [Object, nil] An optional auth provider responding to
        #   `auth_headers`. When present its headers are resolved on every request so
        #   token-based schemes (e.g. OAuth) can refresh an expired token mid-session.
        def initialize(base_url:, max_retries: 2, timeout: 60.0, headers: {}, auth_provider: nil)
          @base_url = base_url
          @max_retries = max_retries
          @timeout = timeout
          @auth_provider = auth_provider
          @default_headers = {
            "X-Fern-Language": "Ruby",
            "X-Fern-SDK-Name": "seed",
            "X-Fern-SDK-Version": "0.0.1"
          }.merge(headers)
        end

        # RFC 7230 token characters (tchar). Any character outside this set in a
        # product token (name/version) is percent-encoded so caller-supplied values
        # cannot break out of the token or inject additional header content.
        USER_AGENT_TCHAR = /[^!#$%&'*+\-.^_`|~0-9A-Za-z]/
        # Characters that must be escaped inside an RFC 9110 comment: the delimiters
        # `(`, `)`, `\`, and control characters (incl. CR/LF).
        USER_AGENT_COMMENT_UNSAFE = /[()\\\x00-\x1f\x7f]/

        # Appends the caller-supplied application product token to a base User-Agent
        # value, producing "{base} {name}/{version} ({comment})" per RFC 9110. The
        # `version` and `comment` segments are omitted when blank. Caller-supplied
        # values are trimmed (blank is treated as absent) and sanitized before being
        # appended so they cannot inject additional header content. Returns the base
        # value unchanged when `app_info` or its `name` is absent.
        # @param user_agent [String] The base User-Agent value.
        # @param app_info [Hash, nil] Optional { name:, version:, comment: } app info.
        # @return [String] The User-Agent value with the app product token appended.
        def self.append_app_info(user_agent, app_info)
          return user_agent if app_info.nil?

          name = encode_user_agent_token((app_info[:name] || app_info["name"]).to_s.strip)
          return user_agent if name.empty?

          product_token = name
          version = encode_user_agent_token((app_info[:version] || app_info["version"]).to_s.strip)
          product_token += "/#{version}" unless version.empty?

          comment = encode_user_agent_comment((app_info[:comment] || app_info["comment"]).to_s.strip)
          product_token += " (#{comment})" unless comment.empty?

          "#{user_agent} #{product_token}"
        end

        # Percent-encodes every non-tchar character so the value is a valid RFC 7230
        # token.
        # @param value [String] The raw product-token value.
        # @return [String] The token-encoded value.
        def self.encode_user_agent_token(value)
          value.gsub(USER_AGENT_TCHAR) { |char| percent_encode_user_agent(char) }
        end

        # Escapes the comment delimiters and control characters so a caller-supplied
        # comment cannot terminate the comment group early or inject header content.
        # @param value [String] The raw comment value.
        # @return [String] The escaped comment value.
        def self.encode_user_agent_comment(value)
          value.gsub(USER_AGENT_COMMENT_UNSAFE) { |char| percent_encode_user_agent(char) }
        end

        # Percent-encodes each byte of the given character as uppercase hex.
        # @param char [String] A single (possibly multibyte) character.
        # @return [String] The percent-encoded representation.
        def self.percent_encode_user_agent(char)
          char.bytes.map { |byte| format("%%%02X", byte) }.join
        end

        # @param request [Seed::Internal::Http::BaseRequest] The HTTP request.
        # @return [HTTP::Response] The HTTP response.
        def send(request)
          url = build_url(request)
          # Resolve auth headers once per request (not per retry) so token-based
          # providers refresh at most once here; static providers are cheap.
          auth_headers = resolve_auth_headers
          attempt = 0
          response = nil

          loop do
            http_request = build_http_request(
              url:,
              method: request.method,
              headers: request.encode_headers(protected_keys: @default_headers.keys + auth_headers.keys),
              body: request.encode_body,
              auth_headers: auth_headers
            )

            conn = connect(url)
            conn.open_timeout = @timeout
            conn.read_timeout = @timeout
            conn.write_timeout = @timeout
            conn.continue_timeout = @timeout

            response = conn.request(http_request)

            break unless should_retry?(response, attempt)

            delay = retry_delay(response, attempt)
            sleep(delay)
            attempt += 1
          end

          response
        end

        # Determines if a request should be retried based on the response status code.
        # @param response [Net::HTTPResponse] The HTTP response.
        # @param attempt [Integer] The current retry attempt (0-indexed).
        # @return [Boolean] Whether the request should be retried.
        def should_retry?(response, attempt)
          return false if attempt >= @max_retries

          status = response.code.to_i
          RETRYABLE_STATUSES.include?(status)
        end

        # Calculates the delay before the next retry attempt using exponential backoff with jitter.
        # Respects Retry-After header if present.
        # @param response [Net::HTTPResponse] The HTTP response.
        # @param attempt [Integer] The current retry attempt (0-indexed).
        # @return [Float] The delay in seconds before the next retry.
        def retry_delay(response, attempt)
          # Check for Retry-After header (can be seconds or HTTP date)
          retry_after = response["Retry-After"]
          if retry_after
            delay = parse_retry_after(retry_after)
            return [delay, MAX_RETRY_DELAY].min if delay&.positive?
          end

          # Exponential backoff with jitter: base_delay * 2^attempt
          base_delay = INITIAL_RETRY_DELAY * (2**attempt)
          add_jitter([base_delay, MAX_RETRY_DELAY].min)
        end

        # Parses the Retry-After header value.
        # @param value [String] The Retry-After header value (seconds or HTTP date).
        # @return [Float, nil] The delay in seconds, or nil if parsing fails.
        def parse_retry_after(value)
          # Try parsing as integer (seconds)
          seconds = Integer(value, exception: false)
          return seconds.to_f if seconds

          # Try parsing as HTTP date
          begin
            retry_time = Time.httpdate(value)
            delay = retry_time - Time.now
            delay.positive? ? delay : nil
          rescue ArgumentError
            nil
          end
        end

        # Adds random jitter to a delay value.
        # @param delay [Float] The base delay in seconds.
        # @return [Float] The delay with jitter applied.
        def add_jitter(delay)
          jitter = delay * JITTER_FACTOR * (rand - 0.5) * 2
          [delay + jitter, 0].max
        end

        LOCALHOST_HOSTS = %w[localhost 127.0.0.1 [::1]].freeze

        # @param request [Seed::Internal::Http::BaseRequest] The HTTP request.
        # @return [URI::Generic] The URL.
        def build_url(request)
          encoded_query = request.encode_query

          # If the path is already an absolute URL, use it directly
          if request.path.start_with?("http://", "https://")
            url = request.path
            url = "#{url}?#{encode_query(encoded_query)}" if encoded_query&.any?
            parsed = URI.parse(url)
            validate_https!(parsed)
            return parsed
          end

          path = request.path.start_with?("/") ? request.path[1..] : request.path
          base = request.base_url || @base_url
          url = "#{base.chomp("/")}/#{path}"
          url = "#{url}?#{encode_query(encoded_query)}" if encoded_query&.any?
          parsed = URI.parse(url)
          validate_https!(parsed)
          parsed
        end

        # Raises if the URL uses http:// for a non-localhost host, which would
        # send authentication credentials in plaintext.
        # @param url [URI::Generic] The parsed URL.
        def validate_https!(url)
          return if url.scheme != "http"
          return if LOCALHOST_HOSTS.include?(url.host)

          raise ArgumentError,
                "Refusing to send request to non-HTTPS URL: #{url}. " \
                "HTTP is only allowed for localhost. Use HTTPS or pass a localhost URL."
        end

        # Resolves the auth headers to send with the next request. Delegates to the
        # configured auth provider (if any) on every call so that token-based
        # providers (e.g. OAuth client-credentials) can refresh an expired token
        # before the request is sent. Returns an empty hash when no provider is set,
        # which keeps the api-key / basic / bearer / no-auth paths unchanged.
        # @return [Hash] The auth headers for the current request.
        def resolve_auth_headers
          return {} if @auth_provider.nil?

          @auth_provider.auth_headers
        end

        # @param url [URI::Generic] The url to the resource.
        # @param method [String] The HTTP method to use.
        # @param headers [Hash] The headers for the request.
        # @param body [String, nil] The body for the request.
        # @param auth_headers [Hash] The auth headers resolved for this request. These
        #   take precedence over the static default headers but not over per-request
        #   headers, mirroring the previous baked-header precedence.
        # @return [HTTP::Request] The HTTP request.
        def build_http_request(url:, method:, headers: {}, body: nil, auth_headers: {})
          request = Net::HTTPGenericRequest.new(
            method,
            !body.nil?,
            method != "HEAD",
            url
          )

          request_headers = @default_headers.merge(auth_headers).merge(headers)
          request_headers.each { |name, value| request[name] = value }
          request.body = body if body

          # Net::HTTP disables its transparent gzip/deflate decoding as soon as an
          # Accept-Encoding header is set explicitly on the request. Re-enable it so
          # that compressed response bodies are still inflated.
          request.extend(DecodeContent) if request_headers.keys.any? { |name| name.to_s.casecmp("accept-encoding").zero? }

          request
        end

        # Keeps Net::HTTP's transparent gzip/deflate response decoding enabled
        # even when an Accept-Encoding header is set explicitly on the request.
        # @api private
        module DecodeContent
          def decode_content # rubocop:disable Naming/PredicateMethod
            true
          end
        end

        # @param query [Hash] The query for the request.
        # @return [String, nil] The encoded query.
        def encode_query(query)
          query.to_h.empty? ? nil : URI.encode_www_form(query)
        end

        # @param url [URI::Generic] The url to connect to.
        # @return [Net::HTTP] The HTTP connection.
        def connect(url)
          is_https = (url.scheme == "https")

          port = if url.port
                   url.port
                 elsif is_https
                   Net::HTTP.https_default_port
                 else
                   Net::HTTP.http_default_port
                 end

          http = Net::HTTP.new(url.host, port)
          http.use_ssl = is_https
          http.verify_mode = OpenSSL::SSL::VERIFY_PEER if is_https
          # NOTE: We handle retries at the application level with HTTP status code awareness,
          # so we set max_retries to 0 to disable Net::HTTP's built-in network-level retries.
          http.max_retries = 0
          http
        end

        # @return [String]
        def inspect
          "#<#{self.class.name}:0x#{object_id.to_s(16)} @base_url=#{@base_url.inspect}>"
        end
      end
    end
  end
end
