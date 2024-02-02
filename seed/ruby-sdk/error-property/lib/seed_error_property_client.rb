# frozen_string_literal: true

require_relative "seed_error_property_client/errors/types/property_based_error_test_body"
require "faraday"
require_relative "seed_error_property_client/property_based_error/client"
require "async/http/faraday"

module SeedErrorPropertyClient
  class Client
    attr_reader :property_based_error_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @property_based_error_client = PropertyBasedError::PropertyBasedErrorClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_property_based_error_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_property_based_error_client = PropertyBasedError::AsyncPropertyBasedErrorClient.new(request_client: request_client)
    end
  end
end
