# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_content_type/service/client"

module SeedContentTypesClient
  class Client
    # @return [SeedContentTypesClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedContentTypesClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedContentTypesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedContentTypesClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedContentTypesClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedContentTypesClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedContentTypesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedContentTypesClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
