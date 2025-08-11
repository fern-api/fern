# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedInferredAuthImplicitClient
  module Nested
    class Client
      # @return [SeedInferredAuthImplicitClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitClient::RequestClient]
      # @return [SeedInferredAuthImplicitClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedInferredAuthImplicitClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedInferredAuthImplicitClient::AsyncRequestClient]
      # @return [SeedInferredAuthImplicitClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedInferredAuthImplicitClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
