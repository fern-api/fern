# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class Object
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [Object]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
