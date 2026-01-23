# frozen_string_literal: true

module FernOauthClientCredentialsNestedRoot
  module NestedNoAuth
    class Client
      # @param client [FernOauthClientCredentialsNestedRoot::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsNestedRoot::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsNestedRoot::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
