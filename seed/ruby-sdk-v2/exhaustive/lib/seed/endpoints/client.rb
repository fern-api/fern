# frozen_string_literal: true

module Seed
  module Endpoints
    class Client
      # @return [Seed::Endpoints::Client]
      def initialize(client:)
        @client = client
      end
    end
  end
end
