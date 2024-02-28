# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_bearer_token_environment_variable_client/service/client"

module SeedBearerTokenEnvironmentVariableClient
  class Client
    attr_reader :service

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, api_key: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          api_key: api_key)
      @service = ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :service

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, api_key: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     api_key: api_key)
      @service = AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
