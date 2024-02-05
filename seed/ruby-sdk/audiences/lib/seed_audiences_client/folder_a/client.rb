# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedAudiencesClient
  module FolderA
    class Client
      # @param request_client [RequestClient]
      # @return [FolderA::Client]
      def initialize(request_client:)
        @service = FolderA::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @param request_client [RequestClient]
      # @return [FolderA::AsyncClient]
      def initialize(request_client:)
        @service = FolderA::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
