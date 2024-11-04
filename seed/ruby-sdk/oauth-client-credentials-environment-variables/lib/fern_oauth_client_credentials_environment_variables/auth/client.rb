# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/token_response"
require "async"

module SeedOauthClientCredentialsEnvironmentVariablesClient
  class AuthClient
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestOptions]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_environment_variables = SeedOauthClientCredentialsEnvironmentVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_environment_variables.auth.get_token_with_client_credentials(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token_with_client_credentials(client_id:, client_secret:, scope: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
      SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse.from_json(json_object: response.body)
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestOptions]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_environment_variables = SeedOauthClientCredentialsEnvironmentVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_environment_variables.auth.refresh_token(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    refresh_token: "refresh_token",
    #    scope: "scope"
    #  )
    def refresh_token(client_id:, client_secret:, refresh_token:, scope: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
          "grant_type": "refresh_token",
          client_id: client_id,
          client_secret: client_secret,
          refresh_token: refresh_token,
          scope: scope
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token"
      end
      SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse.from_json(json_object: response.body)
    end
  end

  class AsyncAuthClient
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestOptions]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_environment_variables = SeedOauthClientCredentialsEnvironmentVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_environment_variables.auth.get_token_with_client_credentials(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    scope: "scope"
    #  )
    def get_token_with_client_credentials(client_id:, client_secret:, scope: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
        SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestOptions]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_environment_variables = SeedOauthClientCredentialsEnvironmentVariablesClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_environment_variables.auth.refresh_token(
    #    client_id: "client_id",
    #    client_secret: "client_secret",
    #    refresh_token: "refresh_token",
    #    scope: "scope"
    #  )
    def refresh_token(client_id:, client_secret:, refresh_token:, scope: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
            "grant_type": "refresh_token",
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
            scope: scope
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedOauthClientCredentialsEnvironmentVariablesClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
