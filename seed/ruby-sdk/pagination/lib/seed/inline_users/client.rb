# frozen_string_literal: true

module Seed
  module InlineUsers
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::InlineUsers::Client]
      def inline_users
        @inline_users ||= Seed::InlineUsers::InlineUsers::Client.new(client: @client)
      end
    end
  end
end
