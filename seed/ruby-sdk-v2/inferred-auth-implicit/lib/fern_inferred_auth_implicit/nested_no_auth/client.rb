# frozen_string_literal: true

module FernInferredAuthImplicit
  module NestedNoAuth
    class Client
      # @param client [FernInferredAuthImplicit::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthImplicit::Api::Client]
      def api
        @api ||= FernInferredAuthImplicit::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
