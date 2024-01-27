# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class Enum
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [Enum]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
