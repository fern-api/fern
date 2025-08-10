# frozen_string_literal: true

require_relative "../../requests"
require_relative "api/client"

module SeedOauthClientCredentialsWithVariablesClient
  module Nested
    class Client
      # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::ApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsWithVariablesClient::RequestClient]
      # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::Client]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsWithVariablesClient::Nested::ApiClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::AsyncApiClient]
      attr_reader :api

      # @param request_client [SeedOauthClientCredentialsWithVariablesClient::AsyncRequestClient]
      # @return [SeedOauthClientCredentialsWithVariablesClient::Nested::AsyncClient]
      def initialize(request_client:)
        @api = SeedOauthClientCredentialsWithVariablesClient::Nested::AsyncApiClient.new(request_client: request_client)
      end
    end
  end
end
