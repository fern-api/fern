# frozen_string_literal: true

module FernOauthClientCredentialsCustom
  module NestedNoAuth
    class Client
      # @param client [FernOauthClientCredentialsCustom::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsCustom::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsCustom::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
