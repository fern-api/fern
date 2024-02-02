# frozen_string_literal: true

require_relative "service/client"

module SeedExamplesClient
  module Health
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return [Health::Client]
      def initialize(client:)
        @service_client = Health::Service::ServiceClient.new(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [Health::AsyncClient]
      def initialize(client:)
        @async_service_client = Health::Service::AsyncServiceClient.new(request_client: @request_client)
      end
    end
  end
end
