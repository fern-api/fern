# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Http
      # @api private
      class RawClient
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

          conn.request(http_request)
        end

        # @param request [<%= gem_namespace %>::Internal::Http::BaseRequest] The HTTP request.
        # @return [URI::Generic] The URL.
        def build_url(request)
          path = request.path.start_with?("/") ? request.path[1..] : request.path
          url = "#{@base_url.chomp("/")}/#{path}"
          url = "#{url}?#{encode_query(request.query)}" if request.query&.any?
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
          http.max_retries = @max_retries
          http
        end
      end
    end
  end
end    