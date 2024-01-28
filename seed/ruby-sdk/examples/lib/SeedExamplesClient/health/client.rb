# frozen_string_literal: true

module SeedExamplesClient
  module Health
    class Client
      attr_reader :client

      # @param client [RequestClient]
      # @return []
      def initialize(client:); end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return []
      def initialize(client:); end
    end
  end
end
