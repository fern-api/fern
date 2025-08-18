
module Seed
  module Endpoints
    class Client
      # @option client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Endpoints::Client]
      def initialize(client)
        @client = client
      end

    end
  end
end
