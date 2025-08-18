# frozen_string_literal: true

require_relative "types_export"
require_relative "core/oauth"
require_relative "requests"
require_relative "fern_oauth_client_credentials_default/auth/client"
require_relative "fern_oauth_client_credentials_default/nested_no_auth/client"
require_relative "fern_oauth_client_credentials_default/nested/client"
require_relative "fern_oauth_client_credentials_default/simple/client"

module SeedOauthClientCredentialsDefaultClient
  class Client
    # @return [SeedOauthClientCredentialsDefaultClient::AuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsDefaultClient::Nested::Client]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsDefaultClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsDefaultClient::Client]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsDefaultClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsDefaultClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @request_client = SeedOauthClientCredentialsDefaultClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: @oauth_provider.method(:token)
      )
      @auth = SeedOauthClientCredentialsDefaultClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedOauthClientCredentialsDefaultClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedOauthClientCredentialsDefaultClient::Nested::Client.new(request_client: @request_client)
      @simple = SeedOauthClientCredentialsDefaultClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsDefaultClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsDefaultClient::AsyncClient]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsDefaultClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsDefaultClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @async_request_client = SeedOauthClientCredentialsDefaultClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsDefaultClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedOauthClientCredentialsDefaultClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @simple = SeedOauthClientCredentialsDefaultClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
