# frozen_string_literal: true

module Seed
  module Health
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Client]
      def service
        @service ||= Seed::Health::Service::Client.new(client: @client)
      end
    end
  end
end

module Seed
  module Health
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::AsyncClient]
      def service
        @service ||= Seed::Health::Service::AsyncClient.new(client: @client)
      end
    end
  end
end
