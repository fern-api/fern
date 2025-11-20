# frozen_string_literal: true

module Seed
  module FolderA
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::FolderA::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Client]
      def service
        @service ||= Seed::FolderA::Service::Client.new(client: @client)
      end
    end
  end
end
