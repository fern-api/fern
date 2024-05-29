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
    # @param grant_type [String]
    # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
    # @return [SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse]
    def get_token(client_id:, client_secret:, grant_type:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          client_id: client_id,
          client_secret: client_secret,
          grant_type: grant_type
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
    # @param grant_type [String]
    # @param request_options [SeedOauthClientCredentialsDefaultClient::RequestOptions]
    # @return [SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse]
    def get_token(client_id:, client_secret:, grant_type:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            client_id: client_id,
            client_secret: client_secret,
            grant_type: grant_type
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/token"
        end
        SeedOauthClientCredentialsDefaultClient::Auth::TokenResponse.from_json(json_object: response.body)
      end
    end
  end
end
