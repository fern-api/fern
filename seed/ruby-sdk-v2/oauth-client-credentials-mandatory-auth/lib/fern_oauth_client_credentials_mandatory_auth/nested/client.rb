# frozen_string_literal: true

module FernOauthClientCredentialsMandatoryAuth
  module Nested
    class Client
      # @param client [FernOauthClientCredentialsMandatoryAuth::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernOauthClientCredentialsMandatoryAuth::Api::Client]
      def api
        @api ||= FernOauthClientCredentialsMandatoryAuth::Nested::Api::Client.new(client: @client)
      end
    end
  end
end
