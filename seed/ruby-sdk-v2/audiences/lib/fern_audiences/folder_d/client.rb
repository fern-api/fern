# frozen_string_literal: true

module FernAudiences
  module FolderD
    class Client
      # @param client [FernAudiences::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernAudiences::Service::Client]
      def service
        @service ||= FernAudiences::FolderD::Service::Client.new(client: @client)
      end
    end
  end
end
