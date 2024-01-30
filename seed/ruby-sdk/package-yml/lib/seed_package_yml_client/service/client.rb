# frozen_string_literal: true

require "async"

module SeedPackageYmlClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param id [String]
      # @param nested_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def nop(id:, nested_id:, request_options: nil)
        @request_client.conn.get("/#{id}/#{nested_id}")
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param id [String]
      # @param nested_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def nop(id:, nested_id:, request_options: nil)
        Async.call do
          @request_client.conn.get("/#{id}/#{nested_id}")
        end
      end
    end
  end
end
