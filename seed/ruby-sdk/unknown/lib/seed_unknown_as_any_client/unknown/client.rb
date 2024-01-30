# frozen_string_literal: true

require "async"

module SeedUnknownAsAnyClient
  module Unknown
    class UnknownClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [UnknownClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Array<Object>]
      def post(request:, request_options: nil)
        @request_client.conn.post("/") do |req|
          req.body = request
        end
      end
    end

    class AsyncUnknownClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncUnknownClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Array<Object>]
      def post(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/") do |req|
            req.body = request
          end
          response
        end
      end
    end
  end
end
