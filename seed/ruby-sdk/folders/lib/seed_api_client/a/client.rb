# frozen_string_literal: true

require_relative "../../requests"
require_relative "b/client"
require_relative "c/client"

module SeedApiClient
  module A
    class Client
      attr_reader :b, :c

      # @param request_client [RequestClient]
      # @return [A::Client]
      def initialize(request_client:)
        @b = A::B::BClient.new(request_client: request_client)
        @c = A::C::CClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      attr_reader :b, :c

      # @param request_client [RequestClient]
      # @return [A::AsyncClient]
      def initialize(request_client:)
        @b = A::B::AsyncBClient.new(request_client: request_client)
        @c = A::C::AsyncCClient.new(request_client: request_client)
      end
    end
  end
end
