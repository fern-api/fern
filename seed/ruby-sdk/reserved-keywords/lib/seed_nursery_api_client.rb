# frozen_string_literal: true

require_relative "seed_nursery_api_client/package/types/package"
require_relative "seed_nursery_api_client/package/types/record"
require "faraday"
require_relative "seed_nursery_api_client/package/client"
require "async/http/faraday"

module SeedNurseryApiClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @package_client = PackageClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_package_client = AsyncPackageClient.initialize(request_client: request_client)
    end
  end
end
