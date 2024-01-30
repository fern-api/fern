# frozen_string_literal: true

require_relative "../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
  module InlinedRequests
    class InlinedRequestsClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [InlinedRequestsClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param string [String]
      # @param integer [Integer]
      # @param nested_object [Types::Object::ObjectWithOptionalField]
      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithOptionalField]
      def post_with_object_bodyand_response(string:, integer:, nested_object:, request_options: nil)
        response = @request_client.conn.post("/req-bodies/object") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.body = { string: "string", integer: "integer", NestedObject: "nested_object" }.compact
        end
        Types::Object::ObjectWithOptionalField.from_json(json_object: response)
      end
    end

    class AsyncInlinedRequestsClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncInlinedRequestsClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param string [String]
      # @param integer [Integer]
      # @param nested_object [Types::Object::ObjectWithOptionalField]
      # @param request_options [RequestOptions]
      # @return [Types::Object::ObjectWithOptionalField]
      def post_with_object_bodyand_response(string:, integer:, nested_object:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/req-bodies/object") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = { string: "string", integer: "integer", NestedObject: "nested_object" }.compact
          end
          Types::Object::ObjectWithOptionalField.from_json(json_object: response)
        end
      end
    end
  end
end
