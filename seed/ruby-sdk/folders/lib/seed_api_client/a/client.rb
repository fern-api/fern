# frozen_string_literal: true

require_relative "b/client"
require_relative "c/client"

module SeedApiClient
  module A
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return []
      def initialize(client:)
        @client = Client.initialize(request_client: @request_client)
        @client = Client.initialize(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return []
      def initialize(client:)
        @async_client = AsyncClient.initialize(request_client: @request_client)
        @async_client = AsyncClient.initialize(request_client: @request_client)
      end
    end
  end
end
