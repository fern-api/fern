# frozen_string_literal: true

module FernInferredAuthImplicitNoExpiry
  module Nested
    class Client
      # @param client [FernInferredAuthImplicitNoExpiry::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthImplicitNoExpiry::Api::Client]
      def api
        @api ||= FernInferredAuthImplicitNoExpiry::Nested::Api::Client.new(client: @client)
      end
    end
  end
end
