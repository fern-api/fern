# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthImplicitNoExpiryClient
  module NestedNoAuth
    class Client
      # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitNoExpiryClient::RequestClient]
      # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitNoExpiryClient::AsyncRequestClient]
      # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
