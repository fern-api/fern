# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsDefaultClient
  module NestedNoAuth
    class Client
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsDefaultClient::RequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsDefaultClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsDefaultClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
