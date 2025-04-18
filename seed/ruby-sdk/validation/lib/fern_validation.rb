# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_validation/types/shape"
require_relative "fern_validation/types/type"

module SeedValidationClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedValidationClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedValidationClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param decimal [Float]
    # @param even [Integer]
    # @param name [String]
    # @param shape [SeedValidationClient::Shape]
    # @param request_options [SeedValidationClient::RequestOptions]
    # @return [SeedValidationClient::Type]
    # @example
    #  validation = SeedValidationClient::Client.new(base_url: "https://api.example.com")
    #  validation.create(
    #    decimal: 2.2,
    #    even: 100,
    #    name: "foo",
    #    shape: SQUARE
    #  )
    def create(decimal:, even:, name:, shape:, request_options: nil)
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
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          decimal: decimal,
          even: even,
          name: name,
          shape: shape
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/create"
      end
      SeedValidationClient::Type.from_json(json_object: response.body)
    end

    # @param decimal [Float]
    # @param even [Integer]
    # @param name [String]
    # @param request_options [SeedValidationClient::RequestOptions]
    # @return [SeedValidationClient::Type]
    # @example
    #  validation = SeedValidationClient::Client.new(base_url: "https://api.example.com")
    #  validation.get(
    #    decimal: 2.2,
    #    even: 100,
    #    name: "foo"
    #  )
    def get(decimal:, even:, name:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "decimal": decimal,
          "even": even,
          "name": name
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      SeedValidationClient::Type.from_json(json_object: response.body)
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedValidationClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedValidationClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end

    # @param decimal [Float]
    # @param even [Integer]
    # @param name [String]
    # @param shape [SeedValidationClient::Shape]
    # @param request_options [SeedValidationClient::RequestOptions]
    # @return [SeedValidationClient::Type]
    # @example
    #  validation = SeedValidationClient::Client.new(base_url: "https://api.example.com")
    #  validation.create(
    #    decimal: 2.2,
    #    even: 100,
    #    name: "foo",
    #    shape: SQUARE
    #  )
    def create(decimal:, even:, name:, shape:, request_options: nil)
      response = @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          decimal: decimal,
          even: even,
          name: name,
          shape: shape
        }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/create"
      end
      SeedValidationClient::Type.from_json(json_object: response.body)
    end

    # @param decimal [Float]
    # @param even [Integer]
    # @param name [String]
    # @param request_options [SeedValidationClient::RequestOptions]
    # @return [SeedValidationClient::Type]
    # @example
    #  validation = SeedValidationClient::Client.new(base_url: "https://api.example.com")
    #  validation.get(
    #    decimal: 2.2,
    #    even: 100,
    #    name: "foo"
    #  )
    def get(decimal:, even:, name:, request_options: nil)
      response = @async_request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "decimal": decimal,
          "even": even,
          "name": name
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@async_request_client.get_url(request_options: request_options)}/"
      end
      SeedValidationClient::Type.from_json(json_object: response.body)
    end
  end
end
