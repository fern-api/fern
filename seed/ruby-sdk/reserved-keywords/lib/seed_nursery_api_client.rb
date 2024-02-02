# frozen_string_literal: true

require_relative "seed_nursery_api_client/package/types/package"
require_relative "seed_nursery_api_client/package/types/record"
require "faraday"
require_relative "seed_nursery_api_client/package/client"
require "async/http/faraday"

module SeedNurseryApiClient
  class Client
    attr_reader :package_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @package_client = Package::PackageClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_package_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_package_client = Package::AsyncPackageClient.new(request_client: request_client)
    end
  end
end
