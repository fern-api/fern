# frozen_string_literal: true

module FernOauthClientCredentialsWithVariables
  module Nested
    class Client
      # @param client [FernOauthClientCredentialsWithVariables::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsWithVariables::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsWithVariables::Nested::Api::Client.new(client: @client)
      end
    end
  end
end
