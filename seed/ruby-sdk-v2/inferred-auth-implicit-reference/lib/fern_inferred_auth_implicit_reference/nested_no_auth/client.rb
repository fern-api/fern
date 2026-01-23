# frozen_string_literal: true

module FernInferredAuthImplicitReference
  module NestedNoAuth
    class Client
      # @param client [FernInferredAuthImplicitReference::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthImplicitReference::Api::Client]
      def api
        @api ||= FernInferredAuthImplicitReference::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
