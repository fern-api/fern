# frozen_string_literal: true

require_relative "service/client"

module SeedExamplesClient
  module File
    module Notification
      class Client
        attr_reader :request_client

        # @param client [RequestClient]
        # @return [File::Notification::Client]
        def initialize(client:)
          @service_client = File::Notification::Service::ServiceClient.new(request_client: @request_client)
        end
      end

      class AsyncClient
        attr_reader :client

        # @param client [AsyncRequestClient]
        # @return [File::Notification::AsyncClient]
        def initialize(client:)
          @async_service_client = File::Notification::Service::AsyncServiceClient.new(request_client: @request_client)
        end
      end
    end
  end
end
