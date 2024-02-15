# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/object/types/object_with_optional_field"
require "async"

module SeedExhaustiveClient
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
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
    end

    # @param request_options [RequestOptions]
    # @return [String]
    def post_with_no_request_body(request_options: nil)
      response = @request_client.conn.post("/no-req-body") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      response.body
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
      Async do
        response = @request_client.conn.get("/no-req-body") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        Types::Object::ObjectWithOptionalField.from_json(json_object: response.body)
      end
    end

    # @param request_options [RequestOptions]
    # @return [String]
    def post_with_no_request_body(request_options: nil)
      Async do
        response = @request_client.conn.post("/no-req-body") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        response.body
      end
    end
  end
end
