# frozen_string_literal: true

require_relative "../../requests"
require_relative "service/client"

module SeedExamplesClient
  module Health
    class Client
      attr_reader :service

      # @param request_client [RequestClient]
      # @return [Health::Client]
      def initialize(request_client:)
        @service = Health::ServiceClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      attr_reader :service

      # @param request_client [RequestClient]
      # @return [Health::AsyncClient]
      def initialize(request_client:)
        @service = Health::AsyncServiceClient.new(request_client: request_client)
      end
    end
  end
end
