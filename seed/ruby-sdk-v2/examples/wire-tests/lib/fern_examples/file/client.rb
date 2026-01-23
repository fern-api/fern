# frozen_string_literal: true

module FernExamples
  module File
    class Client
      # @param client [FernExamples::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernExamples::Notification::Client]
      def notification
        @notification ||= FernExamples::File::Notification::Client.new(client: @client)
      end

      # @return [FernExamples::Service::Client]
      def service
        @service ||= FernExamples::File::Service::Client.new(client: @client)
      end
    end
  end
end
