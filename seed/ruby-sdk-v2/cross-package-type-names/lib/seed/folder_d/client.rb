# frozen_string_literal: true

module Seed
  module FolderD
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::FolderD::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Client]
      def service
        @service ||= Seed::FolderD::Service::Client.new(client: @client)
      end
    end
  end
end
