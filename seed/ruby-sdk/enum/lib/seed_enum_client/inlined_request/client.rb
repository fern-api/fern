# frozen_string_literal: true

require "async"

module SeedEnumClient
  module InlinedRequest
    class InlinedRequestClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [InlinedRequestClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send(value: nil, request_options: nil)
        @request_client.conn.post("/inlined-request") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, value: value }.compact
        end
      end
    end

    class AsyncInlinedRequestClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncInlinedRequestClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send(value: nil, request_options: nil)
        Async.call do
          @request_client.conn.post("/inlined-request") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, value: value }.compact
          end
        end
      end
    end
  end
end
