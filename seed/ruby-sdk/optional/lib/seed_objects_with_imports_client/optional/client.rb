# frozen_string_literal: true

require "async"

module SeedObjectsWithImportsClient
  module Optional
    class OptionalClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [OptionalClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [String]
      def send_optional_body(request: nil, request_options: nil)
        @request_client.conn.post("/send-optional-body") do |req|
          req.body = request
        end
      end
    end

    class AsyncOptionalClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncOptionalClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [String]
      def send_optional_body(request: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/send-optional-body") do |req|
            req.body = request
          end
          response
        end
      end
    end
  end
end
