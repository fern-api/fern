# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsDefaultClient
  module Nested
    class Client
      # @return [SeedOauthClientCredentialsDefaultClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsDefaultClient::RequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsDefaultClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsDefaultClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsDefaultClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsDefaultClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsDefaultClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
