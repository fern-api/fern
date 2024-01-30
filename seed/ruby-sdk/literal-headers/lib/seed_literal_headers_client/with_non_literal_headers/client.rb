# frozen_string_literal: true

require "async"

module SeedLiteralHeadersClient
  module WithNonLiteralHeaders
    class WithNonLiteralHeadersClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [WithNonLiteralHeadersClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param non_literal_endpoint_header [String]
      # @param literal_endpoint_header [String]
      # @param true_endpoint_header [Boolean]
      # @param request_options [RequestOptions]
      # @return [Void]
      def get(non_literal_endpoint_header:, literal_endpoint_header:, true_endpoint_header:, request_options: nil)
        @request_client.conn.post("/with-non-literal-headers") do |req|
          req.headers["X-API-Header"] = @request_client.api_header unless @request_client.api_header.nil?
          req.headers["X-API-Test"] = @request_client.api_test unless @request_client.api_test.nil?
          req.headers["nonLiteralEndpointHeader"] = non_literal_endpoint_header
          req.headers["literalEndpointHeader"] = literal_endpoint_header
          req.headers["trueEndpointHeader"] = true_endpoint_header
        end
      end
    end

    class AsyncWithNonLiteralHeadersClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncWithNonLiteralHeadersClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param non_literal_endpoint_header [String]
      # @param literal_endpoint_header [String]
      # @param true_endpoint_header [Boolean]
      # @param request_options [RequestOptions]
      # @return [Void]
      def get(non_literal_endpoint_header:, literal_endpoint_header:, true_endpoint_header:, request_options: nil)
        Async.call do
          @request_client.conn.post("/with-non-literal-headers") do |req|
            req.headers["X-API-Header"] = @request_client.api_header unless @request_client.api_header.nil?
            req.headers["X-API-Test"] = @request_client.api_test unless @request_client.api_test.nil?
            req.headers["nonLiteralEndpointHeader"] = non_literal_endpoint_header
            req.headers["literalEndpointHeader"] = literal_endpoint_header
            req.headers["trueEndpointHeader"] = true_endpoint_header
          end
        end
      end
    end
  end
end
