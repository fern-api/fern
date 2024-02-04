# frozen_string_literal: true

require_relative "seed_error_property_client/errors/types/property_based_error_test_body"
require "faraday"
require_relative "seed_error_property_client/property_based_error/client"
require "async/http/faraday"

module SeedErrorPropertyClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @property_based_error_client = PropertyBasedErrorClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_property_based_error_client = AsyncPropertyBasedErrorClient.initialize(request_client: request_client)
    end
  end
end
