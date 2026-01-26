# frozen_string_literal: true

module FernCrossPackageTypeNames
  module FolderA
    class Client
      # @param client [FernCrossPackageTypeNames::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @return [FernCrossPackageTypeNames::Service::Client]
      def service
        @service ||= FernCrossPackageTypeNames::FolderA::Service::Client.new(client: @client)
      end
    end
  end
end
