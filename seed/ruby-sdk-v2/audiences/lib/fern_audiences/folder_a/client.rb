# frozen_string_literal: true

module FernAudiences
  module FolderA
    class Client
      # @param client [FernAudiences::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernAudiences::Service::Client]
      def service
        @service ||= FernAudiences::FolderA::Service::Client.new(client: @client)
      end
    end
  end
end
