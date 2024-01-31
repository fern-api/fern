# frozen_string_literal: true

require "async"

module SeedLiteralHeadersClient
  module NoHeaders
    class NoHeadersClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [NoHeadersClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Void]
      def get(request_options: nil)
        @request_client.conn.post("/no-headers") do |req|
          req.headers["X-API-Header"] = @request_client.api_header unless @request_client.api_header.nil?
          req.headers["X-API-Test"] = @request_client.api_test unless @request_client.api_test.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncNoHeadersClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncNoHeadersClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Void]
      def get(request_options: nil)
        Async.call do
          @request_client.conn.post("/no-headers") do |req|
            req.headers["X-API-Header"] = @request_client.api_header unless @request_client.api_header.nil?
            req.headers["X-API-Test"] = @request_client.api_test unless @request_client.api_test.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end
    end
  end
end
