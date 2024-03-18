# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedExhaustiveClient
  class NoAuthClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [NoAuthClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # POST request with no auth
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_no_auth(request: nil, request_options: nil)
      response = @request_client.conn.post("/no-auth") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end

  class AsyncNoAuthClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncNoAuthClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # POST request with no auth
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_no_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post("/no-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end
  end
end
