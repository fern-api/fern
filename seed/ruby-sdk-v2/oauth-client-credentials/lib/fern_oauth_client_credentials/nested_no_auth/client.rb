# frozen_string_literal: true

module FernOauthClientCredentials
  module NestedNoAuth
    class Client
      # @param client [FernOauthClientCredentials::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentials::Api::Client]
      def api
        @api ||= FernOauthClientCredentials::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
