# frozen_string_literal: true

require "async"

module SeedBasicAuthClient
  module BasicAuth
    class BasicAuthClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [BasicAuthClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_basic_auth(request_options: nil)
        @request_client.conn.get("/basic-auth") do |req|
          req.headers["username"] = @request_client.username unless @request_client.username.nil?
          req.headers["password"] = @request_client.password unless @request_client.password.nil?
        end
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_basic_auth(request:, request_options: nil)
        @request_client.conn.post("/basic-auth") do |req|
          req.headers["username"] = @request_client.username unless @request_client.username.nil?
          req.headers["password"] = @request_client.password unless @request_client.password.nil?
          req.body = request
        end
      end
    end

    class AsyncBasicAuthClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncBasicAuthClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Boolean]
      def get_with_basic_auth(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/basic-auth") do |req|
            req.headers["username"] = @request_client.username unless @request_client.username.nil?
            req.headers["password"] = @request_client.password unless @request_client.password.nil?
          end
          response
        end
      end

      # @param request [Object]
      # @param request_options [RequestOptions]
      # @return [Boolean]
      def post_with_basic_auth(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/basic-auth") do |req|
            req.headers["username"] = @request_client.username unless @request_client.username.nil?
            req.headers["password"] = @request_client.password unless @request_client.password.nil?
            req.body = request
          end
          response
        end
      end
    end
  end
end
