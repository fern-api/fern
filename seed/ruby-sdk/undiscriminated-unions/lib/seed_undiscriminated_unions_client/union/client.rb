# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_union"
require "async"

module SeedUndiscriminatedUnionsClient
  class UnionClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [UnionClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param request [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>]
    # @param request_options [RequestOptions]
    # @return [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>]
    def get(request:, request_options: nil)
      response = @request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      Union::MyUnion.from_json(json_object: response.body)
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

    # @param request [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>]
    # @param request_options [RequestOptions]
    # @return [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>]
    def get(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Union::MyUnion.from_json(json_object: response.body)
      end
    end
  end
end
