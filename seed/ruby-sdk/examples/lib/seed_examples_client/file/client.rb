# frozen_string_literal: true

require_relative "notification/service/client"

require_relative "notificationclient"
require_relative "service/client"

module SeedExamplesClient
  module File
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return [File::Client]
      def initialize(client:)
        @client = File::Notification::Client.new(request_client: @request_client)
        @service_client = File::Service::ServiceClient.new(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [File::AsyncClient]
      def initialize(client:)
        @async_client = File::Notification::AsyncClient.new(client: @request_client)
        @async_service_client = File::Service::AsyncServiceClient.new(request_client: @request_client)
      end
    end
  end
end
