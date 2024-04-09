# frozen_string_literal: true

require_relative "../../requests"

module SeedStreamingClient
  class DummyClient
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::RequestClient]
    # @return [SeedStreamingClient::DummyClient]
    def initialize(request_client:)
      # @type [SeedStreamingClient::RequestClient]
      @request_client = request_client
    end
  end

  class AsyncDummyClient
    attr_reader :request_client

    # @param request_client [SeedStreamingClient::AsyncRequestClient]
    # @return [SeedStreamingClient::AsyncDummyClient]
    def initialize(request_client:)
      # @type [SeedStreamingClient::AsyncRequestClient]
      @request_client = request_client
    end
  end
end
