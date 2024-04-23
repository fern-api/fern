# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_oauth_client_credentials_environment_variables/auth/client"

module SeedOauthClientCredentialsEnvironmentVariablesClient
  class Client
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AuthClient]
    attr_reader :auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
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
    # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncAuthClient.new(request_client: @async_request_client)
    end
  end
end
