# frozen_string_literal: true

require "async"

module SeedExhaustiveClient
  module ReqWithHeaders
    class ReqWithHeadersClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [ReqWithHeadersClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param x_test_endpoint_header [String]
      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def get_with_custom_header(x_test_endpoint_header:, request:, request_options: nil)
        @request_client.conn.post("/test-headers/custom-header") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers = {
            **req.headers,
            **request_options&.additional_headers,
            "X-TEST-ENDPOINT-HEADER": x_test_endpoint_header
          }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end
    end

    class AsyncReqWithHeadersClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncReqWithHeadersClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param x_test_endpoint_header [String]
      # @param request [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def get_with_custom_header(x_test_endpoint_header:, request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/test-headers/custom-header") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = {
              **req.headers,
              **request_options&.additional_headers,
              "X-TEST-ENDPOINT-HEADER": x_test_endpoint_header
            }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end
    end
  end
end
