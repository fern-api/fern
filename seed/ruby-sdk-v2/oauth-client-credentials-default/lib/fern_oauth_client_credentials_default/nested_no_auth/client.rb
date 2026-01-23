# frozen_string_literal: true

module FernOauthClientCredentialsDefault
  module NestedNoAuth
    class Client
      # @param client [FernOauthClientCredentialsDefault::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsDefault::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsDefault::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
