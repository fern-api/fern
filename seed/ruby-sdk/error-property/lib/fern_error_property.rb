# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_error_property/property_based_error/client"

module SeedErrorPropertyClient
  class Client
    attr_reader :property_based_error

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @property_based_error = PropertyBasedErrorClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :property_based_error

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @property_based_error = AsyncPropertyBasedErrorClient.new(request_client: @async_request_client)
    end
  end
end
