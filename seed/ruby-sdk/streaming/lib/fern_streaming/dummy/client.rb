# frozen_string_literal: true

require_relative "../../requests"

module SeedStreamingClient
  class DummyClient
    # @return [SeedStreamingClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::RequestClient]
    # @return [SeedStreamingClient::DummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end
  end

  class AsyncDummyClient
    # @return [SeedStreamingClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::AsyncRequestClient]
    # @return [SeedStreamingClient::AsyncDummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end
  end
end
