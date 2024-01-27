# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class Primitive
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [Primitive]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
