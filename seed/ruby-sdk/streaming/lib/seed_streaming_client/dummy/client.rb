# frozen_string_literal: true

module SeedStreamingClient
  module Dummy
    class DummyClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Dummy::DummyClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end
    end

    class AsyncDummyClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Dummy::AsyncDummyClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end
    end
  end
end
