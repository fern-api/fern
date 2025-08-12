# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/token_response"
require "async"

module SeedInferredAuthImplicitClient
  class AuthClient
    # @return [SeedInferredAuthImplicitClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedInferredAuthImplicitClient::RequestClient]
    # @return [SeedInferredAuthImplicitClient::AuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param x_api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
    # @return [SeedInferredAuthImplicitClient::Auth::TokenResponse]
    # @example
    #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
    #  inferred_auth_implicit.auth.get_token_with_client_credentials(
    #    x_api_key: "X-Api-Key",
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token_with_client_credentials(x_api_key:, client_id:, client_secret:, scope: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {}),
          "X-Api-Key": x_api_key
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          "audience": "https://api.example.com",
          "grant_type": "client_credentials",
          client_id: client_id,
          client_secret: client_secret,
          scope: scope
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token"
      end
      SeedInferredAuthImplicitClient::Auth::TokenResponse.from_json(json_object: response.body)
    end

    # @param x_api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param scope [String]
    # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
    # @return [SeedInferredAuthImplicitClient::Auth::TokenResponse]
    # @example
    #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
    #  inferred_auth_implicit.auth.refresh_token(
    #    x_api_key: "X-Api-Key",
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    refresh_token: "refresh_token",
    #    scope: "scope"
    #  )
    def refresh_token(x_api_key:, client_id:, client_secret:, refresh_token:, scope: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {}),
          "X-Api-Key": x_api_key
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          "audience": "https://api.example.com",
          "grant_type": "refresh_token",
          client_id: client_id,
          client_secret: client_secret,
          refresh_token: refresh_token,
          scope: scope
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token/refresh"
      end
      SeedInferredAuthImplicitClient::Auth::TokenResponse.from_json(json_object: response.body)
    end
  end

  class AsyncAuthClient
    # @return [SeedInferredAuthImplicitClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedInferredAuthImplicitClient::AsyncRequestClient]
    # @return [SeedInferredAuthImplicitClient::AsyncAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param x_api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
    # @return [SeedInferredAuthImplicitClient::Auth::TokenResponse]
    # @example
    #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
    #  inferred_auth_implicit.auth.get_token_with_client_credentials(
    #    x_api_key: "X-Api-Key",
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token_with_client_credentials(x_api_key:, client_id:, client_secret:, scope: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {}),
            "X-Api-Key": x_api_key
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            "audience": "https://api.example.com",
            "grant_type": "client_credentials",
            client_id: client_id,
            client_secret: client_secret,
            scope: scope
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedInferredAuthImplicitClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end

    # @param x_api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param scope [String]
    # @param request_options [SeedInferredAuthImplicitClient::RequestOptions]
    # @return [SeedInferredAuthImplicitClient::Auth::TokenResponse]
    # @example
    #  inferred_auth_implicit = SeedInferredAuthImplicitClient::Client.new(base_url: "https://api.example.com")
    #  inferred_auth_implicit.auth.refresh_token(
    #    x_api_key: "X-Api-Key",
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    refresh_token: "refresh_token",
    #    scope: "scope"
    #  )
    def refresh_token(x_api_key:, client_id:, client_secret:, refresh_token:, scope: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {}),
            "X-Api-Key": x_api_key
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            "audience": "https://api.example.com",
            "grant_type": "refresh_token",
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
            scope: scope
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token/refresh"
        end
        SeedInferredAuthImplicitClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
