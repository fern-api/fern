# frozen_string_literal: true

require_relative "../../requests"
require "json"
require_relative "types/my_object"
require "async"

module SeedUnknownAsAnyClient
  class UnknownClient
    # @return [SeedUnknownAsAnyClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnknownAsAnyClient::RequestClient]
    # @return [SeedUnknownAsAnyClient::UnknownClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    # @example
    #  unknown_as_any = SeedUnknownAsAnyClient::Client.new(base_url: "https://api.example.com")
    #  unknown_as_any.unknown.post(request: {"key":"value"})
    def post(request: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      JSON.parse(response.body)
    end

    # @param request [Hash] Request of type SeedUnknownAsAnyClient::Unknown::MyObject, as a Hash
    #   * :unknown (Object)
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    # @example
    #  unknown_as_any = SeedUnknownAsAnyClient::Client.new(base_url: "https://api.example.com")
    #  unknown_as_any.unknown.post_object(request: { unknown: {"key":"value"} })
    def post_object(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/with-object"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncUnknownClient
    # @return [SeedUnknownAsAnyClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedUnknownAsAnyClient::AsyncRequestClient]
    # @return [SeedUnknownAsAnyClient::AsyncUnknownClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Object]
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    # @example
    #  unknown_as_any = SeedUnknownAsAnyClient::Client.new(base_url: "https://api.example.com")
    #  unknown_as_any.unknown.post(request: {"key":"value"})
    def post(request: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request [Hash] Request of type SeedUnknownAsAnyClient::Unknown::MyObject, as a Hash
    #   * :unknown (Object)
    # @param request_options [SeedUnknownAsAnyClient::RequestOptions]
    # @return [Array<Object>]
    # @example
    #  unknown_as_any = SeedUnknownAsAnyClient::Client.new(base_url: "https://api.example.com")
    #  unknown_as_any.unknown.post_object(request: { unknown: {"key":"value"} })
    def post_object(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/with-object"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
