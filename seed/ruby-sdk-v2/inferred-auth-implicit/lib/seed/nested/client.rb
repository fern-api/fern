# frozen_string_literal: true

module Seed
  module Nested
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Api::Client]
      def api
        @api ||= Seed::Nested::Api::Client.new(client: @client)
      end
    end
  end
end

module Seed
  module Nested
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Api::AsyncClient]
      def api
        @api ||= Seed::Nested::Api::AsyncClient.new(client: @client)
      end
    end
  end
end
