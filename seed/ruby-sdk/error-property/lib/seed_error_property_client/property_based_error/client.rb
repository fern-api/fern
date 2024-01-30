# frozen_string_literal: true

require "async"

module SeedErrorPropertyClient
  module PropertyBasedError
    class PropertyBasedErrorClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [PropertyBasedErrorClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def throw_error(request_options: nil)
        @request_client.conn.get("/property-based-error")
      end
    end

    class AsyncPropertyBasedErrorClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncPropertyBasedErrorClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def throw_error(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/property-based-error")
          response
        end
      end
    end
  end
end
