# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedCrossPackageTypeNamesClient
  module FolderD
    class Client
      # @return [SeedCrossPackageTypeNamesClient::FolderD::ServiceClient]
      attr_reader :service

      # @param request_client [SeedCrossPackageTypeNamesClient::RequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::Client]
      def initialize(request_client:)
        @service = SeedCrossPackageTypeNamesClient::FolderD::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedCrossPackageTypeNamesClient::FolderD::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedCrossPackageTypeNamesClient::AsyncRequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderD::AsyncClient]
      def initialize(request_client:)
        @service = SeedCrossPackageTypeNamesClient::FolderD::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
