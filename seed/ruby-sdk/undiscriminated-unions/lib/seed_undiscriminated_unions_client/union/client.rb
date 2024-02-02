# frozen_string_literal: true

require_relative "types/my_union"
require "async"

module SeedUndiscriminatedUnionsClient
  module Union
    class UnionClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Union::UnionClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type Union::MyUnion, as a Hash
      # @param request_options [RequestOptions]
      # @return [Union::MyUnion]
      def get(request:, request_options: nil)
        response = @request_client.conn.post("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
        Union::MyUnion.from_json(json_object: response)
      end
    end

    class AsyncUnionClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Union::AsyncUnionClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type Union::MyUnion, as a Hash
      # @param request_options [RequestOptions]
      # @return [Union::MyUnion]
      def get(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Union::MyUnion.from_json(json_object: response)
        end
      end
    end
  end
end
