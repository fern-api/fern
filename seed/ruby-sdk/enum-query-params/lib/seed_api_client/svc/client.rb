# frozen_string_literal: true

require "async"

module SeedApiClient
  module Svc
    class SvcClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [SvcClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param some_enum [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [String]
      def test(some_enum: nil, request_options: nil)
        @request_client.conn.get("/test") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.params = { "some-enum": "some_enum" }.compact
        end
      end
    end

    class AsyncSvcClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncSvcClient]
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
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.params = { "some-enum": "some_enum" }.compact
          end
          response
        end
      end
    end
  end
end
