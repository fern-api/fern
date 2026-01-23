# frozen_string_literal: true

module FernInferredAuthImplicitNoExpiry
  module NestedNoAuth
    class Client
      # @param client [FernInferredAuthImplicitNoExpiry::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthImplicitNoExpiry::Api::Client]
      def api
        @api ||= FernInferredAuthImplicitNoExpiry::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
