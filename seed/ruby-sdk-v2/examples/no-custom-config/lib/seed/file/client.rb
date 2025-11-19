# frozen_string_literal: true

module Seed
  module File
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::File::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Notification::Client]
      def notification
        @notification ||= Seed::File::Notification::Client.new(client: @client)
      end

      # @return [Seed::Service::Client]
      def service
        @service ||= Seed::File::Service::Client.new(client: @client)
      end
    end
  end
end
