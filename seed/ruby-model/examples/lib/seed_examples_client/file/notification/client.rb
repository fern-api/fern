# frozen_string_literal: true

require_relative "../../../requests"
require_relative "service/client"

module SeedExamplesClient
  module File
    module Notification
      class Client
        # @return [SeedExamplesClient::File::Notification::ServiceClient]
        attr_reader :service

        # @param request_client [SeedExamplesClient::RequestClient]
        # @return [SeedExamplesClient::File::Notification::Client]
        def initialize(request_client:)
          @service = SeedExamplesClient::File::Notification::ServiceClient.new(request_client: request_client)
        end
      end

      class AsyncClient
        # @return [SeedExamplesClient::File::Notification::AsyncServiceClient]
        attr_reader :service

        # @param request_client [SeedExamplesClient::AsyncRequestClient]
        # @return [SeedExamplesClient::File::Notification::AsyncClient]
        def initialize(request_client:)
          @service = SeedExamplesClient::File::Notification::AsyncServiceClient.new(request_client: request_client)
        end
      end
    end
  end
end
