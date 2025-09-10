# frozen_string_literal: true

module Seed
  module NestedNoAuth
    class Client
      # @return [Seed::NestedNoAuth::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Api::Client]
      def api
        @api ||= Seed::NestedNoAuth::Api::Client.new(client: @client)
      end
    end
  end
end
