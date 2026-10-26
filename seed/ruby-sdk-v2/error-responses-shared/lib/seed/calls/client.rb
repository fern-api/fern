# frozen_string_literal: true

module Seed
  module Calls
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Calls::Client]
      def calls
        @calls ||= Seed::Calls::Calls::Client.new(client: @client)
      end
    end
  end
end
