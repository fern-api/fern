# frozen_string_literal: true

require_relative "seed_streaming_client/dummy/types/stream_response"
require "faraday"
require_relative "seed_streaming_client/dummy/client"
require "async/http/faraday"

module SeedStreamingClient
  class Client
    attr_reader :dummy_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @dummy_client = Dummy::DummyClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_dummy_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_dummy_client = Dummy::AsyncDummyClient.new(request_client: request_client)
    end
  end
end
