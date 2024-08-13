# frozen_string_literal: true

require_relative "types_export"
require_relative "core/oauth"
require_relative "requests"
require_relative "fern_any_auth/auth/client"
require_relative "fern_any_auth/user/client"

module SeedAnyAuthClient
  class Client
    # @return [SeedAnyAuthClient::AuthClient]
    attr_reader :auth
    # @return [SeedAnyAuthClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedAnyAuthClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, token: ENV["MY_TOKEN"],
                   api_key: ENV["MY_API_KEY"], client_id: ENV["MY_CLIENT_ID"], client_secret: ENV["MY_CLIENT_SECRET"])
      @oauth_provider = SeedAnyAuthClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedAnyAuthClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds,
          api_key: api_key
        )
      )
      @request_client = SeedAnyAuthClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        api_key: api_key,
        token: @oauth_provider.method(:token)
      )
      @auth = SeedAnyAuthClient::AuthClient.new(request_client: @request_client)
      @user = SeedAnyAuthClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedAnyAuthClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedAnyAuthClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedAnyAuthClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, token: ENV["MY_TOKEN"],
                   api_key: ENV["MY_API_KEY"], client_id: ENV["MY_CLIENT_ID"], client_secret: ENV["MY_CLIENT_SECRET"])
      @oauth_provider = SeedAnyAuthClient::OauthTokenProvider.new(
        client_id: client_id,
        client_secret: client_secret,
        request_client: SeedAnyAuthClient::RequestClient.new(
          base_url: base_url,
          max_retries: max_retries,
          timeout_in_seconds: timeout_in_seconds,
          api_key: api_key
        )
      )
      @async_request_client = SeedAnyAuthClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token,
        api_key: api_key,
        token: token
      )
      @auth = SeedAnyAuthClient::AsyncAuthClient.new(request_client: @async_request_client)
      @user = SeedAnyAuthClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
