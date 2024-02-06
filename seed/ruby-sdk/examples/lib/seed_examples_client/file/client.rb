# frozen_string_literal: true

require_relative "../../requests"
require_relative "notification/client"
require_relative "service/client"

module SeedExamplesClient
  module File
    class Client
      # @param request_client [RequestClient]
      # @return [File::Client]
      def initialize(request_client:)
        @file = File::Notification::Client.new
        @service = File::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @param request_client [RequestClient]
      # @return [File::AsyncClient]
      def initialize(request_client:)
        @file = File::Notification::AsyncClient.new
        @service = File::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
