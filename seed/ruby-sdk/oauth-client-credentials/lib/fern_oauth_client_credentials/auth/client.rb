# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/token_response"
require "async"

module SeedOauthClientCredentialsClient
  class AuthClient
    # @return [SeedOauthClientCredentialsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsClient::RequestClient]
    # @return [SeedOauthClientCredentialsClient::AuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param audience [String]
    # @param grant_type [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsClient::RequestOptions]
    # @return [SeedOauthClientCredentialsClient::Auth::TokenResponse]
    def get_token_with_client_credentials(client_id:, client_secret:, audience:, grant_type:, scope: nil,
                                          request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          client_id: client_id,
          client_secret: client_secret,
          audience: audience,
          grant_type: grant_type,
          scope: scope
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token"
      end
      SeedOauthClientCredentialsClient::Auth::TokenResponse.from_json(json_object: response.body)
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param audience [String]
    # @param grant_type [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsClient::RequestOptions]
    # @return [SeedOauthClientCredentialsClient::Auth::TokenResponse]
    def refresh_token(client_id:, client_secret:, refresh_token:, audience:, grant_type:, scope: nil,
                      request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          client_id: client_id,
          client_secret: client_secret,
          refresh_token: refresh_token,
          audience: audience,
          grant_type: grant_type,
          scope: scope
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/token"
      end
      SeedOauthClientCredentialsClient::Auth::TokenResponse.from_json(json_object: response.body)
    end
  end

  class AsyncAuthClient
    # @return [SeedOauthClientCredentialsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedOauthClientCredentialsClient::AsyncRequestClient]
    # @return [SeedOauthClientCredentialsClient::AsyncAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param audience [String]
    # @param grant_type [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsClient::RequestOptions]
    # @return [SeedOauthClientCredentialsClient::Auth::TokenResponse]
    def get_token_with_client_credentials(client_id:, client_secret:, audience:, grant_type:, scope: nil,
                                          request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            client_id: client_id,
            client_secret: client_secret,
            audience: audience,
            grant_type: grant_type,
            scope: scope
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedOauthClientCredentialsClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param refresh_token [String]
    # @param audience [String]
    # @param grant_type [String]
    # @param scope [String]
    # @param request_options [SeedOauthClientCredentialsClient::RequestOptions]
    # @return [SeedOauthClientCredentialsClient::Auth::TokenResponse]
    def refresh_token(client_id:, client_secret:, refresh_token:, audience:, grant_type:, scope: nil,
                      request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
            audience: audience,
            grant_type: grant_type,
            scope: scope
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedOauthClientCredentialsClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
