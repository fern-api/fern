# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/token_response"
require "async"

module SeedAnyAuthClient
  class AuthClient
    # @return [SeedAnyAuthClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedAnyAuthClient::RequestClient]
    # @return [SeedAnyAuthClient::AuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedAnyAuthClient::RequestOptions]
    # @return [SeedAnyAuthClient::Auth::TokenResponse]
    # @example
    #  any_auth = SeedAnyAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    token: "YOUR_AUTH_TOKEN",
    #    api_key: "YOUR_API_KEY"
    #  )
    #  any_auth.auth.get_token(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token(client_id:, client_secret:, scope: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-API-Key"] = request_options.api_key unless request_options&.api_key.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
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
      SeedAnyAuthClient::Auth::TokenResponse.from_json(json_object: response.body)
    end
  end

  class AsyncAuthClient
    # @return [SeedAnyAuthClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedAnyAuthClient::AsyncRequestClient]
    # @return [SeedAnyAuthClient::AsyncAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedAnyAuthClient::RequestOptions]
    # @return [SeedAnyAuthClient::Auth::TokenResponse]
    # @example
    #  any_auth = SeedAnyAuthClient::Client.new(
    #    base_url: "https://api.example.com",
    #    token: "YOUR_AUTH_TOKEN",
    #    api_key: "YOUR_API_KEY"
    #  )
    #  any_auth.auth.get_token(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token(client_id:, client_secret:, scope: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-API-Key"] = request_options.api_key unless request_options&.api_key.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
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
        SeedAnyAuthClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
