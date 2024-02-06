# frozen_string_literal: true

require_relative "../../requests"
require_relative "notification/client"
require_relative "service/client"

module SeedExamplesClient
  module File
    class Client
      attr_reader :file, :service

      # @param request_client [RequestClient]
      # @return [File::Client]
      def initialize(request_client:)
        @file = File::Notification::Client.new(request_client: request_client)
        @service = File::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      attr_reader :file, :service

      # @param request_client [RequestClient]
      # @return [File::AsyncClient]
      def initialize(request_client:)
        @file = File::Notification::AsyncClient.new(request_client: request_client)
        @service = File::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
