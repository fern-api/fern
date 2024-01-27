# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class Params
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [Params]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
