# frozen_string_literal: true

require "faraday"
require_relative "seed_single_url_environment_no_default_client/dummy/client"
require "async/http/faraday"

module SeedSingleUrlEnvironmentNoDefaultClient
  class Client
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @dummy_client = DummyClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_dummy_client = AsyncDummyClient.initialize(request_client: request_client)
    end
  end
end
