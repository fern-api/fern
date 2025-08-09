# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthImplicitClient
  module NestedNoAuth
    class Client
      # @return [SeedInferredAuthImplicitClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitClient::RequestClient]
      # @return [SeedInferredAuthImplicitClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthImplicitClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitClient::AsyncRequestClient]
      # @return [SeedInferredAuthImplicitClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
