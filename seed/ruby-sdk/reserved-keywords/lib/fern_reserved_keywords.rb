# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_reserved_keywords/package/client"

module SeedNurseryApiClient
  class Client
    # @return [SeedNurseryApiClient::PackageClient]
    attr_reader :package

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedNurseryApiClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedNurseryApiClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @package = SeedNurseryApiClient::PackageClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedNurseryApiClient::AsyncPackageClient]
    attr_reader :package

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedNurseryApiClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedNurseryApiClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @package = SeedNurseryApiClient::AsyncPackageClient.new(request_client: @async_request_client)
    end
  end
end
