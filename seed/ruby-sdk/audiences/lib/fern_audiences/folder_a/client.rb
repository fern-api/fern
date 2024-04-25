# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedAudiencesClient
  module FolderA
    class Client
      # @return [SeedAudiencesClient::FolderA::ServiceClient]
      attr_reader :service

      # @param request_client [SeedAudiencesClient::RequestClient]
      # @return [SeedAudiencesClient::FolderA::Client]
      def initialize(request_client:)
        @service = SeedAudiencesClient::FolderA::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedAudiencesClient::FolderA::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedAudiencesClient::AsyncRequestClient]
      # @return [SeedAudiencesClient::FolderA::AsyncClient]
      def initialize(request_client:)
        @service = SeedAudiencesClient::FolderA::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
