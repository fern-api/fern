# frozen_string_literal: true

module Seed
  module Nested
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      # @param root_variable [String, nil]
      #
      # @return [void]
      def initialize(client:, root_variable: nil)
        @client = client
        @root_variable = root_variable
      end

      # @return [Seed::API::Client]
      def api
        @api ||= Seed::Nested::API::Client.new(client: @client, root_variable: @root_variable)
      end
    end
  end
end
