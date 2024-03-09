# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/shape"
require "async"

module SeedUnionsClient
  class UnionClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [UnionClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param id [String]
    # @param request_options [RequestOptions]
    # @return [Union::Shape]
    def get(id:, request_options: nil)
      response = @request_client.conn.get("/#{id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      Union::Shape.from_json(json_object: response.body)
    end

    # @param request [Union::Shape]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def update(request:, request_options: nil)
      response = @request_client.conn.patch("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
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

    # @param id [String]
    # @param request_options [RequestOptions]
    # @return [Union::Shape]
    def get(id:, request_options: nil)
      Async do
        response = @request_client.conn.get("/#{id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        Union::Shape.from_json(json_object: response.body)
      end
    end

    # @param request [Union::Shape]
    # @param request_options [RequestOptions]
    # @return [Boolean]
    def update(request:, request_options: nil)
      Async do
        response = @request_client.conn.patch("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end
  end
end
