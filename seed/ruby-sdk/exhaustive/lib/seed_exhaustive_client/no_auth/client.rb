# frozen_string_literal: true

require "async"

module SeedExhaustiveClient
  module NoAuth
    class NoAuthClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [NoAuth::NoAuthClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_no_auth(request:, request_options: nil)
        @request_client.conn.post("/no-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end
    end

    class AsyncNoAuthClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [NoAuth::AsyncNoAuthClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_no_auth(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/no-auth") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          response
        end
      end
    end
  end
end
