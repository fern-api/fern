# frozen_string_literal: true

module Seed
  module A
    class Client
      # @return [Seed::A::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::B::Client]
      def b
        @b ||= Seed::A::B::Client.new(client: @client)
      end

      # @return [Seed::C::Client]
      def c
        @c ||= Seed::A::C::Client.new(client: @client)
      end
    end
  end
end
