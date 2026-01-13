# frozen_string_literal: true

require "async"
require "async/http/internet"
require "uri"

module <%= gem_namespace %>
  module Internal
    module Http
      # @api private
      # Async HTTP client using the async-http gem for non-blocking requests
      class AsyncRawClient
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
        # @return [AsyncResponse] The HTTP response wrapped in an async-compatible object.
        def send(request)
          url = build_url(request)
          headers = @default_headers.merge(request.encode_headers)
          body = request.encode_body

          Async do
            internet = Async::HTTP::Internet.new

            begin
              response = internet.call(
                request.method.upcase,
                url.to_s,
                headers.map { |k, v| [k.to_s, v.to_s] },
                body ? [body] : []
              )

              AsyncResponse.new(
                code: response.status.to_s,
                body: response.read
              )
            ensure
              internet.close
            end
          end.wait
        end

        # @param request [<%= gem_namespace %>::Internal::Http::BaseRequest] The HTTP request.
        # @return [URI::Generic] The URL.
        def build_url(request)
          # If the path is already an absolute URL, use it directly
          if request.path.start_with?("http://", "https://")
            url = request.path
            url = "#{url}?#{encode_query(request.query)}" if request.query&.any?
            return URI.parse(url)
          end

          path = request.path.start_with?("/") ? request.path[1..] : request.path
          base = request.base_url || @base_url
          url = "#{base.chomp("/")}/#{path}"
          url = "#{url}?#{encode_query(request.query)}" if request.query&.any?
          URI.parse(url)
        end

        # @param query [Hash] The query for the request.
        # @return [String, nil] The encoded query.
        def encode_query(query)
          query.to_h.empty? ? nil : URI.encode_www_form(query)
        end

        # @return [String]
        def inspect
          "#<#{self.class.name}:0x#{object_id.to_s(16)} @base_url=#{@base_url.inspect}>"
        end
      end

      # @api private
      # Response wrapper for async HTTP responses to match Net::HTTP response interface
      class AsyncResponse
        attr_reader :code, :body

        def initialize(code:, body:)
          @code = code
          @body = body
        end
      end
    end
  end
end
