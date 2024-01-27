# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class Container
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [Container]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
