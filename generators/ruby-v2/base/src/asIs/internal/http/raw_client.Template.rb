# frozen_string_literal: true

module <%= gem_namespace %>
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
        def initialize(base_url:, max_retries: 2, timeout: 60.0, headers: {})
          @base_url = base_url
          @max_retries = max_retries
          @timeout = timeout
          @default_headers = {
            "X-Fern-Language": "Ruby",
            "X-Fern-SDK-Name": "<%= sdkName %>",
            "X-Fern-SDK-Version": "0.0.1"
          }.merge(headers)
        end

        # @param request [<%= gem_namespace %>::Internal::Http::BaseRequest] The HTTP request.
        # @return [HTTP::Response] The HTTP response.
        def send(request)
          url = build_url(request)
          attempt = 0
          response = nil

          loop do
            http_request = build_http_request(
              url:,
              method: request.method,
              headers: request.encode_headers,
              body: request.encode_body
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
        # Respects Retry-After and X-RateLimit-Reset headers if present.
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

          # Check for X-RateLimit-Reset header (Unix timestamp)
          rate_limit_reset = response["X-RateLimit-Reset"]
          if rate_limit_reset
            reset_time = rate_limit_reset.to_i
            delay = reset_time - Time.now.to_i
            return add_jitter([delay, MAX_RETRY_DELAY].min) if delay.positive?
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

        # @param request [<%= gem_namespace %>::Internal::Http::BaseRequest] The HTTP request.
        # @return [URI::Generic] The URL.
        def build_url(request)
          encoded_query = request.encode_query

          # If the path is already an absolute URL, use it directly
          if request.path.start_with?("http://", "https://")
            url = request.path
            url = "#{url}?#{encode_query(encoded_query)}" if encoded_query&.any?
            return URI.parse(url)
          end

          path = request.path.start_with?("/") ? request.path[1..] : request.path
          base = request.base_url || @base_url
          url = "#{base.chomp("/")}/#{path}"
          url = "#{url}?#{encode_query(encoded_query)}" if encoded_query&.any?
          URI.parse(url)
        end

        # @param url [URI::Generic] The url to the resource.
        # @param method [String] The HTTP method to use.
        # @param headers [Hash] The headers for the request.
        # @param body [String, nil] The body for the request.
        # @return [HTTP::Request] The HTTP request.
        def build_http_request(url:, method:, headers: {}, body: nil)
          request = Net::HTTPGenericRequest.new(
            method,
            !body.nil?,
            method != "HEAD",
            url
          )

          request_headers = @default_headers.merge(headers)
          request_headers.each { |name, value| request[name] = value }
          request.body = body if body

          request
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
          # Note: We handle retries at the application level with HTTP status code awareness,
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