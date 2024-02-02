# frozen_string_literal: true

require "faraday"
require_relative "seed_single_url_environment_default_client/dummy/client"
require "async/http/faraday"

module SeedSingleUrlEnvironmentDefaultClient
  class Client
    attr_reader :dummy_client

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.new(environment: environment, max_retries: max_retries,
                                         timeout_in_seconds: timeout_in_seconds, token: token)
      @dummy_client = Dummy::DummyClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_dummy_client

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_dummy_client = Dummy::AsyncDummyClient.new(request_client: request_client)
    end
  end
end
