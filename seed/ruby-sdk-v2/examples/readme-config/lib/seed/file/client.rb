# frozen_string_literal: true

module Seed
  module File
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
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

module Seed
  module File
    class AsyncClient
      # @param client [Seed::Internal::Http::AsyncRawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Notification::AsyncClient]
      def notification
        @notification ||= Seed::File::Notification::AsyncClient.new(client: @client)
      end

      # @return [Seed::Service::AsyncClient]
      def service
        @service ||= Seed::File::Service::AsyncClient.new(client: @client)
      end
    end
  end
end
