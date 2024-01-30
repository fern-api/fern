# frozen_string_literal: true

require_relative "../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module NoReqBody
    class NoReqBodyClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [NoReqBodyClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithOptionalField]
      def get_with_no_request_body(request_options: nil)
        response = @request_client.conn.get("/no-req-body") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
        end
        Types::Object::ObjectWithOptionalField.from_json(json_object: response)
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def post_with_no_request_body(request_options: nil)
        @request_client.conn.post("/no-req-body") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
        end
      end
    end

    class AsyncNoReqBodyClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncNoReqBodyClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithOptionalField]
      def get_with_no_request_body(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/no-req-body") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end
      end

      # @param request_options [RequestOptions]
      # @return [String]
      def post_with_no_request_body(request_options: nil)
        Async.call do
          response = @request_client.conn.post("/no-req-body") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
          response
        end
      end
    end
  end
end
