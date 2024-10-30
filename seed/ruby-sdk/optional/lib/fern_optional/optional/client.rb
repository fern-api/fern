# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedObjectsWithImportsClient
  class OptionalClient
    # @return [SeedObjectsWithImportsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedObjectsWithImportsClient::RequestClient]
    # @return [SeedObjectsWithImportsClient::OptionalClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash{String => Object}]
    # @param request_options [SeedObjectsWithImportsClient::RequestOptions]
    # @return [String]
    # @example
    #  objects_with_imports = SeedObjectsWithImportsClient::Client.new(base_url: "https://api.example.com")
    #  objects_with_imports.optional.send_optional_body(request: { "string": {"key":"value"} })
    def send_optional_body(request: nil, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/send-optional-body"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncOptionalClient
    # @return [SeedObjectsWithImportsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedObjectsWithImportsClient::AsyncRequestClient]
    # @return [SeedObjectsWithImportsClient::AsyncOptionalClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash{String => Object}]
    # @param request_options [SeedObjectsWithImportsClient::RequestOptions]
    # @return [String]
    # @example
    #  objects_with_imports = SeedObjectsWithImportsClient::Client.new(base_url: "https://api.example.com")
    #  objects_with_imports.optional.send_optional_body(request: { "string": {"key":"value"} })
    def send_optional_body(request: nil, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/send-optional-body"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
