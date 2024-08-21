# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedAudiencesClient
  module FolderD
    class Client
      # @return [SeedAudiencesClient::FolderD::ServiceClient]
      attr_reader :service

      # @param request_client [SeedAudiencesClient::RequestClient]
      # @return [SeedAudiencesClient::FolderD::Client]
      def initialize(request_client:)
        @service = SeedAudiencesClient::FolderD::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedAudiencesClient::FolderD::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedAudiencesClient::AsyncRequestClient]
      # @return [SeedAudiencesClient::FolderD::AsyncClient]
      def initialize(request_client:)
        @service = SeedAudiencesClient::FolderD::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
