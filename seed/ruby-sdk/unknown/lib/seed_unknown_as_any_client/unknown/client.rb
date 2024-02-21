# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedUnknownAsAnyClient
  class UnknownClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [UnknownClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Array<Object>]
    def post(request:, request_options: nil)
      response = @request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end

  class AsyncUnknownClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncUnknownClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Array<Object>]
    def post(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end
  end
end
