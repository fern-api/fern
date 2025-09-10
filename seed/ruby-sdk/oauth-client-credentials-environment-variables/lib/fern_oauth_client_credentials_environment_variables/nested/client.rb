# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsEnvironmentVariablesClient
  module Nested
    class Client
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::RequestClient]
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsEnvironmentVariablesClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsEnvironmentVariablesClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
