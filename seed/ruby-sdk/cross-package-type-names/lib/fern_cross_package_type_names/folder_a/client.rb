# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedCrossPackageTypeNamesClient
  module FolderA
    class Client
      # @return [SeedCrossPackageTypeNamesClient::FolderA::ServiceClient]
      attr_reader :service

      # @param request_client [SeedCrossPackageTypeNamesClient::RequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderA::Client]
      def initialize(request_client:)
        @service = SeedCrossPackageTypeNamesClient::FolderA::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedCrossPackageTypeNamesClient::FolderA::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedCrossPackageTypeNamesClient::AsyncRequestClient]
      # @return [SeedCrossPackageTypeNamesClient::FolderA::AsyncClient]
      def initialize(request_client:)
        @service = SeedCrossPackageTypeNamesClient::FolderA::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
