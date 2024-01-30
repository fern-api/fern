# frozen_string_literal: true

require_relative "types/my_union"
require "async"

module SeedUndiscriminatedUnionsClient
  module Union
    class UnionClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [UnionClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Union::MyUnion]
      # @param request_options [RequestOptions]
      # @return [Union::MyUnion]
      def get(request:, request_options: nil)
        response = @request_client.conn.post("/") do |req|
          req.body = request
        end
        Union::MyUnion.from_json(json_object: response)
      end
    end

    class AsyncUnionClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncUnionClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Union::MyUnion]
      # @param request_options [RequestOptions]
      # @return [Union::MyUnion]
      def get(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/") do |req|
            req.body = request
          end
          Union::MyUnion.from_json(json_object: response)
        end
      end
    end
  end
end
