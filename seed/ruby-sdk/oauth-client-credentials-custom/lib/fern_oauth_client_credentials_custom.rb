# frozen_string_literal: true

require_relative "types_export"
require_relative "core/oauth"
require_relative "requests"
require_relative "fern_oauth_client_credentials_custom/auth/client"
require_relative "fern_oauth_client_credentials_custom/nested_no_auth/client"
require_relative "fern_oauth_client_credentials_custom/nested/client"
require_relative "fern_oauth_client_credentials_custom/simple/client"

module SeedOauthClientCredentialsClient
  class Client
    # @return [SeedOauthClientCredentialsClient::AuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsClient::Nested::Client]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsClient::Client]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @request_client = SeedOauthClientCredentialsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: @oauth_provider.method(:token)
      )
      @auth = SeedOauthClientCredentialsClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedOauthClientCredentialsClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedOauthClientCredentialsClient::Nested::Client.new(request_client: @request_client)
      @simple = SeedOauthClientCredentialsClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsClient::AsyncClient]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @async_request_client = SeedOauthClientCredentialsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedOauthClientCredentialsClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedOauthClientCredentialsClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @simple = SeedOauthClientCredentialsClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
