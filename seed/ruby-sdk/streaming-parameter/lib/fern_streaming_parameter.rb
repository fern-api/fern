# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_streaming_parameter/dummy/client"

module SeedStreamingClient
  class Client
    # @return [SeedStreamingClient::DummyClient]
    attr_reader :dummy

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedStreamingClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedStreamingClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @dummy = SeedStreamingClient::DummyClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedStreamingClient::AsyncDummyClient]
    attr_reader :dummy

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedStreamingClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedStreamingClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @dummy = SeedStreamingClient::AsyncDummyClient.new(request_client: @async_request_client)
    end
  end
end
