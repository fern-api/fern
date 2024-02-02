# frozen_string_literal: true

require_relative "service/client"

module SeedAudiencesClient
  module FolderA
    class Client
      attr_reader :request_client

      # @param client [RequestClient]
      # @return [FolderA::Client]
      def initialize(client:)
        @service_client = FolderA::Service::ServiceClient.new(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [FolderA::AsyncClient]
      def initialize(client:)
        @async_service_client = FolderA::Service::AsyncServiceClient.new(request_client: @request_client)
      end
    end
  end
end
