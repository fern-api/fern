# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_bearer_token_environment_variable/service/client"

module SeedBearerTokenEnvironmentVariableClient
  class Client
    # @return [SeedBearerTokenEnvironmentVariableClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [SeedBearerTokenEnvironmentVariableClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, api_key: ENV["COURIER_API_KEY"])
      @request_client = SeedBearerTokenEnvironmentVariableClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        api_key: api_key
      )
      @service = SeedBearerTokenEnvironmentVariableClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil, api_key: ENV["COURIER_API_KEY"])
      @async_request_client = SeedBearerTokenEnvironmentVariableClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        api_key: api_key
      )
      @service = SeedBearerTokenEnvironmentVariableClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
