# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthExplicitClient
  module NestedNoAuth
    class Client
      # @return [SeedInferredAuthExplicitClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthExplicitClient::RequestClient]
      # @return [SeedInferredAuthExplicitClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthExplicitClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthExplicitClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthExplicitClient::AsyncRequestClient]
      # @return [SeedInferredAuthExplicitClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthExplicitClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
