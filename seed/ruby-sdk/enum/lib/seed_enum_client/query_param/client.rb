# frozen_string_literal: true

require "async"

module SeedEnumClient
  module QueryParam
    class QueryParamClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [QueryParamClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send(value: nil, request_options: nil)
        @request_client.conn.post("/query") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = { **request_options&.additional_query_parameters, "value": value }.compact
        end
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_list(value: nil, request_options: nil)
        @request_client.conn.post("/query-list") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = { **request_options&.additional_query_parameters, "value": value }.compact
        end
      end
    end

    class AsyncQueryParamClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncQueryParamClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send(value: nil, request_options: nil)
        Async.call do
          @request_client.conn.post("/query") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "value": value }.compact
          end
        end
      end

      # @param value [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Void]
      def send_list(value: nil, request_options: nil)
        Async.call do
          @request_client.conn.post("/query-list") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "value": value }.compact
          end
        end
      end
    end
  end
end
