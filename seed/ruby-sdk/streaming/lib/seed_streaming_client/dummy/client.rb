# frozen_string_literal: true

module SeedStreamingClient
  module Dummy
    class DummyClient
      attr_reader :client
    end

    class AsyncDummyClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [AsyncDummyClient]
      def initialize(client:)
        # @type [AsyncRequestClient]
        @client = client
      end
    end
  end
end
