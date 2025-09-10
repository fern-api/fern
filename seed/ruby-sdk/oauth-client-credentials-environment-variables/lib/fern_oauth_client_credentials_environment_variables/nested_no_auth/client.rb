# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsEnvironmentVariablesClient
  module NestedNoAuth
    class Client
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient]
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsEnvironmentVariablesClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
