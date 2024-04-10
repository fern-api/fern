# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedExamplesClient
  module Health
    class Client
      # @return [SeedExamplesClient::Health::ServiceClient]
      attr_reader :service

      # @param request_client [SeedExamplesClient::RequestClient]
      # @return [SeedExamplesClient::Health::Client]
      def initialize(request_client:)
        @service = SeedExamplesClient::Health::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedExamplesClient::Health::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedExamplesClient::AsyncRequestClient]
      # @return [SeedExamplesClient::Health::AsyncClient]
      def initialize(request_client:)
        @service = SeedExamplesClient::Health::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
