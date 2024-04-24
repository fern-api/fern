# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_variables/service/client"

module SeedVariablesClient
  class Client
    # @return [SeedVariablesClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedVariablesClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedVariablesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedVariablesClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedVariablesClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedVariablesClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedVariablesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedVariablesClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
