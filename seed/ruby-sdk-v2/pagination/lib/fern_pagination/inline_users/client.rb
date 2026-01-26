# frozen_string_literal: true

module FernPagination
  module InlineUsers
    class Client
      # @param client [FernPagination::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernPagination::InlineUsers::Client]
      def inline_users
        @inline_users ||= FernPagination::InlineUsers::InlineUsers::Client.new(client: @client)
      end
    end
  end
end
