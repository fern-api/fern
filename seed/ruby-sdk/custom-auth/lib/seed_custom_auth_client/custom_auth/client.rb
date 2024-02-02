# frozen_string_literal: true

require "async"

module SeedCustomAuthClient
  module CustomAuth
    class CustomAuthClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [CustomAuth::CustomAuthClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_custom_auth(request_options: nil)
        @request_client.conn.get("/custom-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = @request_client.custom_auth_scheme if @request_client.custom_auth_scheme.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_custom_auth(request:, request_options: nil)
        @request_client.conn.post("/custom-auth") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["X-API-KEY"] = @request_client.custom_auth_scheme if @request_client.custom_auth_scheme.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end
    end

    class AsyncCustomAuthClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [CustomAuth::AsyncCustomAuthClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_custom_auth(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/custom-auth") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["X-API-KEY"] = @request_client.custom_auth_scheme if @request_client.custom_auth_scheme.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
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
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["X-API-KEY"] = @request_client.custom_auth_scheme if @request_client.custom_auth_scheme.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          response
        end
      end
    end
  end
end
