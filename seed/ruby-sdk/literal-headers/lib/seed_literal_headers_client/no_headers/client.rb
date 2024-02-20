# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedLiteralHeadersClient
  class NoHeadersClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [NoHeadersClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def get(request_options: nil)
      @request_client.conn.post("/no-headers") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
        req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
    end
  end

  class AsyncNoHeadersClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncNoHeadersClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param request_options [RequestOptions]
    # @return [Void]
    def get(request_options: nil)
      Async do
        @request_client.conn.post("/no-headers") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Header"] = request_options.api_header unless request_options&.api_header.nil?
          req.headers["X-API-Test"] = request_options.api_test unless request_options&.api_test.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
      end
    end
  end
end
