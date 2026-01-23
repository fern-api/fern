# frozen_string_literal: true

module FernInferredAuthImplicitApiKey
  module NestedNoAuth
    class Client
      # @param client [FernInferredAuthImplicitApiKey::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthImplicitApiKey::Api::Client]
      def api
        @api ||= FernInferredAuthImplicitApiKey::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
