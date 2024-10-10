# frozen_string_literal: true

require_relative "../../requests"
require_relative "b/client"
require_relative "c/client"

module SeedApiClient
  module A
    class Client
      # @return [SeedApiClient::A::B::BClient]
      attr_reader :b
      # @return [SeedApiClient::A::C::CClient]
      attr_reader :c

      # @param request_client [SeedApiClient::RequestClient]
      # @return [SeedApiClient::A::Client]
      def initialize(request_client:)
        @b = SeedApiClient::A::B::BClient.new(request_client: request_client)
        @c = SeedApiClient::A::C::CClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedApiClient::A::B::AsyncBClient]
      attr_reader :b
      # @return [SeedApiClient::A::C::AsyncCClient]
      attr_reader :c

      # @param request_client [SeedApiClient::AsyncRequestClient]
      # @return [SeedApiClient::A::AsyncClient]
      def initialize(request_client:)
        @b = SeedApiClient::A::B::AsyncBClient.new(request_client: request_client)
        @c = SeedApiClient::A::C::AsyncCClient.new(request_client: request_client)
      end
    end
  end
end
