# frozen_string_literal: true

module FernFolders
  module A
    class Client
      # @param client [FernFolders::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernFolders::B::Client]
      def b
        @b ||= FernFolders::A::B::Client.new(client: @client)
      end

      # @return [FernFolders::C::Client]
      def c
        @c ||= FernFolders::A::C::Client.new(client: @client)
      end
    end
  end
end
