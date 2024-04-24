# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_error_property/property_based_error/client"

module SeedErrorPropertyClient
  class Client
    # @return [SeedErrorPropertyClient::PropertyBasedErrorClient]
    attr_reader :property_based_error

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedErrorPropertyClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedErrorPropertyClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @property_based_error = SeedErrorPropertyClient::PropertyBasedErrorClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedErrorPropertyClient::AsyncPropertyBasedErrorClient]
    attr_reader :property_based_error

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedErrorPropertyClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedErrorPropertyClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @property_based_error = SeedErrorPropertyClient::AsyncPropertyBasedErrorClient.new(request_client: @async_request_client)
    end
  end
end
