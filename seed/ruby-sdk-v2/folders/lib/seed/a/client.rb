# frozen_string_literal: true

module Seed
  module A
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::B::Client]
      def b
        @b ||= Seed::A::B::Client.new(client: @client)
      end

      # @return [Seed::C::Client]
      def c
        @c ||= Seed::A::C::Client.new(client: @client)
      end
    end
  end
end

module Seed
  module A
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::B::AsyncClient]
      def b
        @b ||= Seed::A::B::AsyncClient.new(client: @client)
      end

      # @return [Seed::C::AsyncClient]
      def c
        @c ||= Seed::A::C::AsyncClient.new(client: @client)
      end
    end
  end
end
