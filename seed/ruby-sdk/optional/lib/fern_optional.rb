# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_optional/optional/client"

module SeedObjectsWithImportsClient
  class Client
    # @return [SeedObjectsWithImportsClient::OptionalClient]
    attr_reader :optional

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedObjectsWithImportsClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedObjectsWithImportsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @optional = SeedObjectsWithImportsClient::OptionalClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedObjectsWithImportsClient::AsyncOptionalClient]
    attr_reader :optional

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedObjectsWithImportsClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedObjectsWithImportsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @optional = SeedObjectsWithImportsClient::AsyncOptionalClient.new(request_client: @async_request_client)
    end
  end
end
