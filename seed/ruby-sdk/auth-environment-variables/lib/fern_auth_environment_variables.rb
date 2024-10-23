# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_auth_environment_variables/service/client"

module SeedAuthEnvironmentVariablesClient
  class Client
    # @return [SeedAuthEnvironmentVariablesClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @return [SeedAuthEnvironmentVariablesClient::Client]
    def initialize(x_another_header:, x_api_version:, base_url: nil, max_retries: nil, timeout_in_seconds: nil,
                   api_key: ENV["FERN_API_KEY"])
      @request_client = SeedAuthEnvironmentVariablesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        api_key: api_key,
        x_another_header: x_another_header,
        x_api_version: x_api_version
      )
      @service = SeedAuthEnvironmentVariablesClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedAuthEnvironmentVariablesClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @param x_another_header [String]
    # @param x_api_version [String]
    # @return [SeedAuthEnvironmentVariablesClient::AsyncClient]
    def initialize(x_another_header:, x_api_version:, base_url: nil, max_retries: nil, timeout_in_seconds: nil,
                   api_key: ENV["FERN_API_KEY"])
      @async_request_client = SeedAuthEnvironmentVariablesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        api_key: api_key,
        x_another_header: x_another_header,
        x_api_version: x_api_version
      )
      @service = SeedAuthEnvironmentVariablesClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
