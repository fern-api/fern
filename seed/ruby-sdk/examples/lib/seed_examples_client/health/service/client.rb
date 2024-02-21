# frozen_string_literal: true

require_relative "../../../requests"
require "async"

module SeedExamplesClient
  module Health
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Health::ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # This endpoint checks the health of a resource.
      #
      # @param id [String] The id to check
      # @param request_options [RequestOptions]
      # @return [Void]
      def check(id:, request_options: nil)
        @request_client.conn.get("/check/#{id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
      end

      # This endpoint checks the health of the service.
      #
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def ping(request_options: nil)
        response = @request_client.conn.get("/ping") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Health::AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # This endpoint checks the health of a resource.
      #
      # @param id [String] The id to check
      # @param request_options [RequestOptions]
      # @return [Void]
      def check(id:, request_options: nil)
        Async do
          @request_client.conn.get("/check/#{id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          end
        end
      end

      # This endpoint checks the health of the service.
      #
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def ping(request_options: nil)
        Async do
          response = @request_client.conn.get("/ping") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          end
          response.body
        end
      end
    end
  end
end
