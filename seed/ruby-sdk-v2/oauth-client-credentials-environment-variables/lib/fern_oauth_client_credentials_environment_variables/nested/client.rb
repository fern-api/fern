# frozen_string_literal: true

module FernOauthClientCredentialsEnvironmentVariables
  module Nested
    class Client
      # @param client [FernOauthClientCredentialsEnvironmentVariables::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsEnvironmentVariables::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsEnvironmentVariables::Nested::Api::Client.new(client: @client)
      end
    end
  end
end
