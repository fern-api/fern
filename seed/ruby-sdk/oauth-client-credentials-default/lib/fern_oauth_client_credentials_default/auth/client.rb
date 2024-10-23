# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/token_response"
require "async"

module SeedOauthClientCredentialsDefaultClient
  class AuthClient
    # @return [SeedOauthClientCredentialsDefaultClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsDefaultClient::RequestClient]
    # @return [SeedOauthClientCredentialsDefaultClient::AuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
    # @return [SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_default = SeedOauthClientCredentialsDefaultClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_default.auth.get_token(client_id: "client_id", client_secret: "client_secret")
    def get_token(client_id:, client_secret:, request_options: nil)
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
          "grant_type": "client_credentials",
          client_id: client_id,
          client_secret: client_secret
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token"
      end
      SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse.from_json(json_object: response.body)
    end
  end

  class AsyncAuthClient
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
    # @return [SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse]
    # @example
    #  oauth_client_credentials_default = SeedOauthClientCredentialsDefaultClient::Client.new(base_url: "https://api.example.com")
    #  oauth_client_credentials_default.auth.get_token(client_id: "client_id", client_secret: "client_secret")
    def get_token(client_id:, client_secret:, request_options: nil)
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
            "grant_type": "client_credentials",
            client_id: client_id,
            client_secret: client_secret
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
