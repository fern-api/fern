# frozen_string_literal: true

module SeedFileUploadClient
  module Service
    class ServiceClient
      attr_reader :client
    end

    class AsyncServiceClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [AsyncServiceClient]
      def initialize(client:)
        # @type [AsyncRequestClient]
        @client = client
      end
    end
  end
end
