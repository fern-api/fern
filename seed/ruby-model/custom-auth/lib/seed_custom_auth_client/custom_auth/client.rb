# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedCustomAuthClient
  class CustomAuthClient
    # @return [SeedCustomAuthClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedCustomAuthClient::RequestClient]
    # @return [SeedCustomAuthClient::CustomAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom auth scheme
    #
    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  custom_auth = SeedCustomAuthClient::Client.new(base_url: "https://api.example.com", custom_auth_scheme: "YOUR_CUSTOM_AUTH_SCHEME")
    #  custom_auth.custom_auth.get_with_custom_auth
    def get_with_custom_auth(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
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
        req.url "#{@request_client.get_url(request_options: request_options)}/custom-auth"
      end
      JSON.parse(response.body)
    end

    # POST request with custom auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  custom_auth = SeedCustomAuthClient::Client.new(base_url: "https://api.example.com", custom_auth_scheme: "YOUR_CUSTOM_AUTH_SCHEME")
    #  custom_auth.custom_auth.post_with_custom_auth(request: {"key":"value"})
    def post_with_custom_auth(request: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/custom-auth"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncCustomAuthClient
    # @return [SeedCustomAuthClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedCustomAuthClient::AsyncRequestClient]
    # @return [SeedCustomAuthClient::AsyncCustomAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom auth scheme
    #
    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  custom_auth = SeedCustomAuthClient::Client.new(base_url: "https://api.example.com", custom_auth_scheme: "YOUR_CUSTOM_AUTH_SCHEME")
    #  custom_auth.custom_auth.get_with_custom_auth
    def get_with_custom_auth(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/custom-auth"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # POST request with custom auth scheme
    #
    # @param request [Object]
    # @param request_options [SeedCustomAuthClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  custom_auth = SeedCustomAuthClient::Client.new(base_url: "https://api.example.com", custom_auth_scheme: "YOUR_CUSTOM_AUTH_SCHEME")
    #  custom_auth.custom_auth.post_with_custom_auth(request: {"key":"value"})
    def post_with_custom_auth(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = request_options.custom_auth_scheme unless request_options&.custom_auth_scheme.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/custom-auth"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
