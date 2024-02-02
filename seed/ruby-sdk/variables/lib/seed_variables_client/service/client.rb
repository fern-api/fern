# frozen_string_literal: true

require "async"

module SeedVariablesClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Service::ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param endpoint_param [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def post(endpoint_param:, request_options: nil)
        @request_client.conn.post("/#{endpoint_param}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Service::AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param endpoint_param [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def post(endpoint_param:, request_options: nil)
        Async.call do
          @request_client.conn.post("/#{endpoint_param}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end
    end
  end
end
