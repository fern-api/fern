# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsClient
  module Nested
    class Client
      # @return [SeedOauthClientCredentialsClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsClient::RequestClient]
      # @return [SeedOauthClientCredentialsClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
