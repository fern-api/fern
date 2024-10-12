# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedBasicAuthClient
  class BasicAuthClient
    # @return [SeedBasicAuthClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBasicAuthClient::RequestClient]
    # @return [SeedBasicAuthClient::BasicAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  basic_auth = SeedBasicAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    username: "YOUR_USERNAME",
    #    password: "YOUR_PASSWORD"
    #  )
    #  basic_auth.basic_auth.get_with_basic_auth
    def get_with_basic_auth(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.basic_auth_token unless request_options&.basic_auth_token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
      end
      JSON.parse(response.body)
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  basic_auth = SeedBasicAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    username: "YOUR_USERNAME",
    #    password: "YOUR_PASSWORD"
    #  )
    #  basic_auth.basic_auth.post_with_basic_auth(request: {"key":"value"})
    def post_with_basic_auth(request: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.basic_auth_token unless request_options&.basic_auth_token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncBasicAuthClient
    # @return [SeedBasicAuthClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBasicAuthClient::AsyncRequestClient]
    # @return [SeedBasicAuthClient::AsyncBasicAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with basic auth scheme
    #
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  basic_auth = SeedBasicAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    username: "YOUR_USERNAME",
    #    password: "YOUR_PASSWORD"
    #  )
    #  basic_auth.basic_auth.get_with_basic_auth
    def get_with_basic_auth(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.basic_auth_token unless request_options&.basic_auth_token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # POST request with basic auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedBasicAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  basic_auth = SeedBasicAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    username: "YOUR_USERNAME",
    #    password: "YOUR_PASSWORD"
    #  )
    #  basic_auth.basic_auth.post_with_basic_auth(request: {"key":"value"})
    def post_with_basic_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.basic_auth_token unless request_options&.basic_auth_token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/basic-auth"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
