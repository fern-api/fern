# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/response"
require "json"
require_relative "../types/string_response"
require_relative "types/optional_with_docs"
require_relative "../types/optional_string_response"
require "async"

module SeedResponsePropertyClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [ServiceClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["data"].to_json
      Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie_docs(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["docs"].to_json
      Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [StringResponse]
    def get_movie_name(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["data"].to_json
      StringResponse.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie_metadata(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["metadata"].to_json
      Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_optional_movie(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["data"].to_json
      Service::Response.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::OPTIONAL_WITH_DOCS]
    def get_optional_movie_docs(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["docs"].to_json
      Service::WithDocs.from_json(json_object: nested_response_json)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [OPTIONAL_STRING_RESPONSE]
    def get_optional_movie_name(request:, request_options: nil)
      response = @request_client.conn.post("/movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      parsed_json JSON.parse(response.body)
      nested_response_json parsed_json["data"].to_json
      StringResponse.from_json(json_object: nested_response_json)
    end
  end

  class AsyncServiceClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncServiceClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["data"].to_json
        Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie_docs(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["docs"].to_json
        Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [StringResponse]
    def get_movie_name(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["data"].to_json
        StringResponse.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_movie_metadata(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["metadata"].to_json
        Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::Response]
    def get_optional_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["data"].to_json
        Service::Response.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [Service::OPTIONAL_WITH_DOCS]
    def get_optional_movie_docs(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["docs"].to_json
        Service::WithDocs.from_json(json_object: nested_response_json)
      end
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [OPTIONAL_STRING_RESPONSE]
    def get_optional_movie_name(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        parsed_json JSON.parse(response.body)
        nested_response_json parsed_json["data"].to_json
        StringResponse.from_json(json_object: nested_response_json)
      end
    end
  end
end
