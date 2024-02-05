# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_nursery_api_client/package/client"

module SeedNurseryApiClient
  class Client
    attr_reader :package

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @package = PackageClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :package

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @package = AsyncPackageClient.new(request_client: @async_request_client)
    end
  end
end
