# frozen_string_literal: true

require "async"

module SeedAuthEnvironmentVariablesClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def get_with_api_key(request_options: nil)
        @request_client.conn.get("/apiKey") do |req|
          req.headers["X-FERN-API-KEY"] = @request_client.api_key unless @request_client.api_key.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
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

      # @param request_options [RequestOptions]
      # @return [String]
      def get_with_api_key(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/apiKey") do |req|
            req.headers["X-FERN-API-KEY"] = @request_client.api_key unless @request_client.api_key.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          response
        end
      end
    end
  end
end
