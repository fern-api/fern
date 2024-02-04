# frozen_string_literal: true

require_relative "service/client"

module SeedExamplesClient
  module File
    module Notification
      class Client
        attr_reader :request_client

        # @param client [RequestClient]
        # @return []
        def initialize(client:)
          @service_client = ServiceClient.initialize(request_client: @request_client)
        end
      end

      class AsyncClient
        attr_reader :client

        # @param client [AsyncRequestClient]
        # @return []
        def initialize(client:)
          @async_service_client = AsyncServiceClient.initialize(request_client: @request_client)
        end
      end
    end
  end
end
