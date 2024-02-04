# frozen_string_literal: true

require "async"

module SeedBytesClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [String] Base64 encoded bytes
      # @param request_options [RequestOptions]
      # @return [Void]
      def upload(request:, request_options: nil)
        @request_client.conn.post("/upload-content") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.headers["Content-Type"] = "application/octet-stream"
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
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

      # @param request [String] Base64 encoded bytes
      # @param request_options [RequestOptions]
      # @return [Void]
      def upload(request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/upload-content") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.headers["Content-Type"] = "application/octet-stream"
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end
    end
  end
end
