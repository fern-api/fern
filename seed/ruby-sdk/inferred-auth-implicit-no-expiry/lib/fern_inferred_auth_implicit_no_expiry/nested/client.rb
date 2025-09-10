# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthImplicitNoExpiryClient
  module Nested
    class Client
      # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitNoExpiryClient::RequestClient]
      # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitNoExpiryClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitNoExpiryClient::AsyncRequestClient]
      # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitNoExpiryClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
