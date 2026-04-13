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

      # @return [Seed::API::Client]
      def api
        @api ||= Seed::Nested::API::Client.new(client: @client)
      end
    end
  end
end
