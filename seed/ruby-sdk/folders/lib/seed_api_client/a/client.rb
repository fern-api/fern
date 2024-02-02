# frozen_string_literal: true

require_relative "b/client"
require_relative "c/client"

module SeedApiClient
  module A
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return [A::Client]
      def initialize(client:)
        @client = A::B::Client.new(request_client: @request_client)
        @client = A::C::Client.new(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [A::AsyncClient]
      def initialize(client:)
        @async_client = A::B::AsyncClient.new(request_client: @request_client)
        @async_client = A::C::AsyncClient.new(request_client: @request_client)
      end
    end
  end
end
