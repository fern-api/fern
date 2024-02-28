# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedCustomAuthClient
  class CustomAuthClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [CustomAuthClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # GET request with custom auth scheme
    #
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def get_with_custom_auth(request_options: nil)
      response = @request_client.conn.get("/custom-auth") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
    end

    # POST request with custom auth scheme
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_custom_auth(request: nil, request_options: nil)
      response = @request_client.conn.post("/custom-auth") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end

  class AsyncCustomAuthClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncCustomAuthClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # GET request with custom auth scheme
    #
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def get_with_custom_auth(request_options: nil)
      Async do
        response = @request_client.conn.get("/custom-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end

    # POST request with custom auth scheme
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_custom_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post("/custom-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end
  end
end
