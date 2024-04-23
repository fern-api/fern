# frozen_string_literal: true

<<<<<<< HEAD
require_relative "types_export"
require_relative "requests"
require_relative "fern_oauth_client_credentials/auth/client"

module SeedOauthClientCredentialsClient
  class Client
    # @return [SeedOauthClientCredentialsClient::AuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedOauthClientCredentialsClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedOauthClientCredentialsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsClient::AuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedOauthClientCredentialsClient::AsyncAuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedOauthClientCredentialsClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedOauthClientCredentialsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @auth = SeedOauthClientCredentialsClient::AsyncAuthClient.new(request_client: @async_request_client)
    end
  end
end
=======
require_relative "fern_oauth_client_credentials/auth/types/token_response"
>>>>>>> main
