# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_simple_api/user/client"

module SeedSimpleApiClient
  class Client
    # @return [SeedSimpleApiClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param environment [SeedSimpleApiClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSimpleApiClient::Client]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedSimpleApiClient::RequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @user = SeedSimpleApiClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedSimpleApiClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param environment [SeedSimpleApiClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSimpleApiClient::AsyncClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedSimpleApiClient::AsyncRequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @user = SeedSimpleApiClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
