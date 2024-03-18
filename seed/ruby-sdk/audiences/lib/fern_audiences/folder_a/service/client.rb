# frozen_string_literal: true

require_relative "../../../requests"
require_relative "types/response"
require "async"

module SeedAudiencesClient
  module FolderA
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [FolderA::ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [FolderA::Service::Response]
      def get_direct_thread(request_options: nil)
        response = @request_client.conn.get("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        FolderA::Service::Response.from_json(json_object: response.body)
      end
    end

    class AsyncServiceClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [FolderA::AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [FolderA::Service::Response]
      def get_direct_thread(request_options: nil)
        Async do
          response = @request_client.conn.get("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          end
          FolderA::Service::Response.from_json(json_object: response.body)
        end
      end
    end
  end
end
