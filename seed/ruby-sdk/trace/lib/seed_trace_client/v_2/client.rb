# frozen_string_literal: true

require "async"

module SeedTraceClient
  module V2
    class Client
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Client]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Void]
      def test(request_options: nil)
        @request_client.conn.get("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Void]
      def test(request_options: nil)
        Async.call do
          @request_client.conn.get("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end
    end
  end
end
