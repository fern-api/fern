# frozen_string_literal: true

module SeedExamplesClient
  module File
    class Client
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return []
      def initialize(client:); end
    end

    class AsyncClient
      attr_reader :client

      # @param client [TODOMERGECLIENT]
      # @return []
      def initialize(client:); end
    end
  end
end
