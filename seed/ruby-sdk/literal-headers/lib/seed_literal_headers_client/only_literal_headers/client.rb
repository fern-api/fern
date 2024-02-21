# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedLiteralHeadersClient
  class OnlyLiteralHeadersClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [OnlyLiteralHeadersClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param literal_endpoint_header [String]
    # @param false_endpoint_header [Boolean]
    # @param request_options [RequestOptions]
    # @return [Void]
    def get(literal_endpoint_header:, false_endpoint_header:, request_options: nil)
      @request_client.conn.post("/only-literal-headers") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
        req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
        req.headers = {
          **req.headers,
          **(request_options&.additional_headers || {}),
          "literalEndpointHeader": literal_endpoint_header,
          "falseEndpointHeader": false_endpoint_header
        }.compact
      end
    end
  end

  class AsyncOnlyLiteralHeadersClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncOnlyLiteralHeadersClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param literal_endpoint_header [String]
    # @param false_endpoint_header [Boolean]
    # @param request_options [RequestOptions]
    # @return [Void]
    def get(literal_endpoint_header:, false_endpoint_header:, request_options: nil)
      Async do
        @request_client.conn.post("/only-literal-headers") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
          req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
          req.headers = {
            **req.headers,
            **(request_options&.additional_headers || {}),
            "literalEndpointHeader": literal_endpoint_header,
            "falseEndpointHeader": false_endpoint_header
          }.compact
        end
      end
    end
  end
end
