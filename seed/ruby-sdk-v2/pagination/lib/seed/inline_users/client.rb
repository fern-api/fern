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

module Seed
  module InlineUsers
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::InlineUsers::AsyncClient]
      def inline_users
        @inline_users ||= Seed::InlineUsers::InlineUsers::AsyncClient.new(client: @client)
      end
    end
  end
end
