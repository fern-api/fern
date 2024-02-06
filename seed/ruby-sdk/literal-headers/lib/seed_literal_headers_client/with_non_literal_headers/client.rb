# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedLiteralHeadersClient
  class WithNonLiteralHeadersClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [WithNonLiteralHeadersClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param non_literal_endpoint_header [String]
    # @param literal_endpoint_header [String]
    # @param true_endpoint_header [Boolean]
    # @param request_options [RequestOptions]
    # @return [Void]
    def get(non_literal_endpoint_header:, literal_endpoint_header:, true_endpoint_header:, request_options: nil)
      @request_client.conn.post("/with-non-literal-headers") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
        req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
        req.headers = {
          **req.headers,
          **(request_options&.additional_headers || {}),
          "nonLiteralEndpointHeader": non_literal_endpoint_header,
          "literalEndpointHeader": literal_endpoint_header,
          "trueEndpointHeader": true_endpoint_header
        }.compact
      end
    end
  end

  class AsyncWithNonLiteralHeadersClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncWithNonLiteralHeadersClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param non_literal_endpoint_header [String]
    # @param literal_endpoint_header [String]
    # @param true_endpoint_header [Boolean]
    # @param request_options [RequestOptions]
    # @return [Void]
    def get(non_literal_endpoint_header:, literal_endpoint_header:, true_endpoint_header:, request_options: nil)
      Async do
        @request_client.conn.post("/with-non-literal-headers") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
          req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
          req.headers = {
            **req.headers,
            **(request_options&.additional_headers || {}),
            "nonLiteralEndpointHeader": non_literal_endpoint_header,
            "literalEndpointHeader": literal_endpoint_header,
            "trueEndpointHeader": true_endpoint_header
          }.compact
        end
      end
    end
  end
end
