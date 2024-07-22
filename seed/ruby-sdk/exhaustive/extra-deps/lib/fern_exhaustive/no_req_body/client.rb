# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/object/types/object_with_optional_field"
require "json"
require "async"

module SeedExhaustiveClient
  class NoReqBodyClient
    # @return [SeedExhaustiveClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::RequestClient]
    # @return [SeedExhaustiveClient::NoReqBodyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_req_body.get_with_no_request_body
    def get_with_no_request_body(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
      end
      SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [String]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_req_body.post_with_no_request_body
    def post_with_no_request_body(request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncNoReqBodyClient
    # @return [SeedExhaustiveClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
    # @return [SeedExhaustiveClient::AsyncNoReqBodyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_req_body.get_with_no_request_body
    def get_with_no_request_body(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
        end
        SeedExhaustiveClient::Types::Object_::ObjectWithOptionalField.from_json(json_object: response.body)
      end
    end

    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [String]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_req_body.post_with_no_request_body
    def post_with_no_request_body(request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/no-req-body"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
