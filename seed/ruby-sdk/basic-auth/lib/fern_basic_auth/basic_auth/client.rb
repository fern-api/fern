# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBasicAuthClient
  class BasicAuthClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [BasicAuthClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def get_with_basic_auth(request_options: nil)
      response = @request_client.conn.get("/basic-auth") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["username"] = request_options.username unless request_options&.username.nil?
        req.headers["password"] = request_options.password unless request_options&.password.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_basic_auth(request: nil, request_options: nil)
      response = @request_client.conn.post("/basic-auth") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["username"] = request_options.username unless request_options&.username.nil?
        req.headers["password"] = request_options.password unless request_options&.password.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end
  end

  class AsyncBasicAuthClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncBasicAuthClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def get_with_basic_auth(request_options: nil)
      Async do
        response = @request_client.conn.get("/basic-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["username"] = request_options.username unless request_options&.username.nil?
          req.headers["password"] = request_options.password unless request_options&.password.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def post_with_basic_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post("/basic-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["username"] = request_options.username unless request_options&.username.nil?
          req.headers["password"] = request_options.password unless request_options&.password.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end
  end
end
