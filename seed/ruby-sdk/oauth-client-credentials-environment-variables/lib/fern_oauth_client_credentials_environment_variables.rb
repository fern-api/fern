# frozen_string_literal: true

require_relative "types_export"
require_relative "core/oauth"
require_relative "requests"
require_relative "fern_oauth_client_credentials_environment_variables/auth/client"

module SeedOauthClientCredentialsEnvironmentVariablesClient
  class Client
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, client_id: ENV["CLIENT_ID"],
                   client_secret: ENV["CLIENT_SECRET"])
      @oauth_provider = SeedOauthClientCredentialsEnvironmentVariablesClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @request_client = SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: @oauth_provider.method(:token)
      )
      @auth = SeedOauthClientCredentialsEnvironmentVariablesClient::AuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncAuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, client_id: ENV["CLIENT_ID"],
                   client_secret: ENV["CLIENT_SECRET"])
      @oauth_provider = SeedOauthClientCredentialsEnvironmentVariablesClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @async_request_client = SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncAuthClient.new(request_client: @async_request_client)
    end
  end
end
