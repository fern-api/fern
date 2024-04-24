# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_mixed_case/service/client"

module SeedMixedCaseClient
  class Client
    # @return [SeedMixedCaseClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedMixedCaseClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedMixedCaseClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedMixedCaseClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedMixedCaseClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedMixedCaseClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedMixedCaseClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedMixedCaseClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
