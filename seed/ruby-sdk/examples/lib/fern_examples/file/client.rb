# frozen_string_literal: true

require_relative "../../requests"
require_relative "notification/client"
require_relative "service/client"

module SeedExamplesClient
  module File
    class Client
      # @return [SeedExamplesClient::File::Notification::Client]
      attr_reader :file
      # @return [SeedExamplesClient::File::ServiceClient]
      attr_reader :service

      # @param request_client [SeedExamplesClient::RequestClient]
      # @return [SeedExamplesClient::File::Client]
      def initialize(request_client:)
        @file = SeedExamplesClient::File::Notification::Client.new(request_client: request_client)
        @service = SeedExamplesClient::File::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedExamplesClient::File::Notification::AsyncClient]
      attr_reader :file
      # @return [SeedExamplesClient::File::AsyncServiceClient]
      attr_reader :service

      # @param request_client [SeedExamplesClient::AsyncRequestClient]
      # @return [SeedExamplesClient::File::AsyncClient]
      def initialize(request_client:)
        @file = SeedExamplesClient::File::Notification::AsyncClient.new(request_client: request_client)
        @service = SeedExamplesClient::File::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
