# frozen_string_literal: true

require "async"

module SeedCustomAuthClient
  module CustomAuth
    class CustomAuthClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [CustomAuthClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_custom_auth(request_options: nil)
        @request_client.conn.get("/custom-auth") do |req|
          req.headers["X-API-KEY"] = @request_client.custom_auth_scheme unless @request_client.custom_auth_scheme.nil?
        end
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_custom_auth(request:, request_options: nil)
        @request_client.conn.post("/custom-auth") do |req|
          req.headers["X-API-KEY"] = @request_client.custom_auth_scheme unless @request_client.custom_auth_scheme.nil?
          req.body = request
        end
      end
    end

    class AsyncCustomAuthClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncCustomAuthClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_custom_auth(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/custom-auth") do |req|
            req.headers["X-API-KEY"] = @request_client.custom_auth_scheme unless @request_client.custom_auth_scheme.nil?
          end
          response
        end
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_custom_auth(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/custom-auth") do |req|
            req.headers["X-API-KEY"] = @request_client.custom_auth_scheme unless @request_client.custom_auth_scheme.nil?
            req.body = request
          end
          response
        end
      end
    end
  end
end
