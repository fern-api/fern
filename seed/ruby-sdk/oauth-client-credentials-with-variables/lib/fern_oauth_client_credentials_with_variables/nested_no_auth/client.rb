# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsWithVariablesClient
  module NestedNoAuth
    class Client
      # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsWithVariablesClient::RequestClient]
      # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsWithVariablesClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsWithVariablesClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
