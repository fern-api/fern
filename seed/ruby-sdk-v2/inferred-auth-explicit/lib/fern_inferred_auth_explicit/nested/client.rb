# frozen_string_literal: true

module FernInferredAuthExplicit
  module Nested
    class Client
      # @param client [FernInferredAuthExplicit::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernInferredAuthExplicit::Api::Client]
      def api
        @api ||= FernInferredAuthExplicit::Nested::Api::Client.new(client: @client)
      end
    end
  end
end
