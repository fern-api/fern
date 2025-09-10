# frozen_string_literal: true

require_relative "types_export"
require_relative "core/oauth"
require_relative "requests"
require_relative "fern_oauth_client_credentials_with_variables/auth/client"
require_relative "fern_oauth_client_credentials_with_variables/nested_no_auth/client"
require_relative "fern_oauth_client_credentials_with_variables/nested/client"
require_relative "fern_oauth_client_credentials_with_variables/service/client"
require_relative "fern_oauth_client_credentials_with_variables/simple/client"

module SeedOauthClientCredentialsWithVariablesClient
  class Client
    # @return [SeedOauthClientCredentialsWithVariablesClient::AuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::Client]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsWithVariablesClient::ServiceClient]
    attr_reader :service
    # @return [SeedOauthClientCredentialsWithVariablesClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsWithVariablesClient::Client]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsWithVariablesClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsWithVariablesClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @request_client = SeedOauthClientCredentialsWithVariablesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: @oauth_provider.method(:token)
      )
      @auth = SeedOauthClientCredentialsWithVariablesClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedOauthClientCredentialsWithVariablesClient::Nested::Client.new(request_client: @request_client)
      @service = SeedOauthClientCredentialsWithVariablesClient::ServiceClient.new(request_client: @request_client)
      @simple = SeedOauthClientCredentialsWithVariablesClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncServiceClient]
    attr_reader :service
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsWithVariablesClient::AsyncClient]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @oauth_provider = SeedOauthClientCredentialsWithVariablesClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedOauthClientCredentialsWithVariablesClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds
        )
      )
      @async_request_client = SeedOauthClientCredentialsWithVariablesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsWithVariablesClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedOauthClientCredentialsWithVariablesClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @service = SeedOauthClientCredentialsWithVariablesClient::AsyncServiceClient.new(request_client: @async_request_client)
      @simple = SeedOauthClientCredentialsWithVariablesClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
