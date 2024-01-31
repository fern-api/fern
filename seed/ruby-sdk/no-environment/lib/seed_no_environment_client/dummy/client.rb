# frozen_string_literal: true

require "async"

module SeedNoEnvironmentClient
  module Dummy
    class DummyClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [DummyClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def get_dummy(request_options: nil)
        @request_client.conn.get("/dummy") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncDummyClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncDummyClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def get_dummy(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/dummy") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          response
        end
      end
    end
  end
end
