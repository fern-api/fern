# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsClient
  module NestedNoAuth
    class Client
      # @return [SeedOauthClientCredentialsClient::NestedNoAuth::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsClient::RequestClient]
      # @return [SeedOauthClientCredentialsClient::NestedNoAuth::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsClient::NestedNoAuth::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsClient::NestedNoAuth::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsClient::NestedNoAuth::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsClient::NestedNoAuth::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
