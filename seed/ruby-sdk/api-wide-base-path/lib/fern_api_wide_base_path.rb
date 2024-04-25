# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_api_wide_base_path/service/client"

module SeedApiWideBasePathClient
  class Client
    # @return [SeedApiWideBasePathClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiWideBasePathClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedApiWideBasePathClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedApiWideBasePathClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedApiWideBasePathClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedApiWideBasePathClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedApiWideBasePathClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedApiWideBasePathClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
