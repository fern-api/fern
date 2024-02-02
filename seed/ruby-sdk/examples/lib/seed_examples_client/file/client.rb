# frozen_string_literal: true

require_relative "notification/service/client"
require_relative "notificationclient"
require_relative "service/client"

module SeedExamplesClient
  module File
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return []
      def initialize(client:)
        @client = Client.initialize(request_client: @request_client)
        @service_client = ServiceClient.initialize(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return []
      def initialize(client:)
        @async_client = AsyncClient.initialize(client: @request_client)
        @async_service_client = AsyncServiceClient.initialize(request_client: @request_client)
      end
    end
  end
end
