# frozen_string_literal: true

require "faraday"
require_relative "seed_bearer_token_environment_variable_client/service/client"
require "async/http/faraday"

module SeedBearerTokenEnvironmentVariableClient
  class Client
    attr_reader :service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, api_key: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                         api_key: api_key)
      @service_client = Service::ServiceClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_key [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, api_key: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_service_client = Service::AsyncServiceClient.new(request_client: request_client)
    end
  end
end
