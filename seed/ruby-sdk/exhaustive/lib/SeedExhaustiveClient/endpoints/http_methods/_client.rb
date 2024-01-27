# frozen_string_literal: true

module SeedExhaustiveClient
  module Endpoints
    class HttpMethods
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return [HttpMethods]
      def initialize(client:)
        # @type [TODOMERGECLIENT]
        @client = client
      end
    end
  end
end
