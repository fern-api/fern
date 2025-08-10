# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthExplicitClient
  module Nested
    class Client
      # @return [SeedInferredAuthExplicitClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthExplicitClient::RequestClient]
      # @return [SeedInferredAuthExplicitClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthExplicitClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthExplicitClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthExplicitClient::AsyncRequestClient]
      # @return [SeedInferredAuthExplicitClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthExplicitClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
