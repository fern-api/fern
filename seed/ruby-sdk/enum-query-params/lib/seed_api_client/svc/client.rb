# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedApiClient
  module Svc
    class SvcClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Svc::SvcClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param some_enum [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [String]
      def test(some_enum: nil, request_options: nil)
        response = @request_client.conn.get("/test") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = { **request_options&.additional_query_parameters, "some-enum": some_enum }.compact
        end
        response.body
      end
    end

    class AsyncSvcClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Svc::AsyncSvcClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param some_enum [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [String]
      def test(some_enum: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/test") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "some-enum": some_enum }.compact
          end
          response.body
        end
      end
    end
  end
end
