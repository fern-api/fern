# frozen_string_literal: true

module Seed
  module Messages
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Messages::Client]
      def messages
        @messages ||= Seed::Messages::Messages::Client.new(client: @client)
      end
    end
  end
end
