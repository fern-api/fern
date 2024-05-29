# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_oauth_client_credentials_default_client/auth/client"

module SeedOauthClientCredentialsDefaultClient
  class Client
    # @return [SeedOauthClientCredentialsDefaultClient::AuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedOauthClientCredentialsDefaultClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedOauthClientCredentialsDefaultClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsDefaultClient::AuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncAuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedOauthClientCredentialsDefaultClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsDefaultClient::AsyncAuthClient.new(request_client: @async_request_client)
    end
  end
end
