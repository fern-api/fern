# frozen_string_literal: true

require_relative "seed_streaming_client/dummy/types/stream_response"
require "faraday"
require_relative "seed_streaming_client/dummy/client"
require "async/http/faraday"

module SeedStreamingClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @dummy_client = DummyClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_dummy_client = AsyncDummyClient.initialize(request_client: request_client)
    end
  end
end
