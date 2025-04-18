# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_examples/file/client"
require_relative "fern_examples/health/client"
require_relative "fern_examples/service/client"
require "json"
require_relative "fern_examples/types/type"
require_relative "fern_examples/types/identifier"

module SeedExamplesClient
  class Client
    # @return [SeedExamplesClient::File::Client]
    attr_reader :file
    # @return [SeedExamplesClient::Health::Client]
    attr_reader :health
    # @return [SeedExamplesClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::Client]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedExamplesClient::RequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @file = SeedExamplesClient::File::Client.new(request_client: @request_client)
      @health = SeedExamplesClient::Health::Client.new(request_client: @request_client)
      @service = SeedExamplesClient::ServiceClient.new(request_client: @request_client)
    end

    # @param request [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.echo(request: "Hello world!\n\nwith\n\tnewlines")
    def echo(request:, request_options: nil)
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
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      JSON.parse(response.body)
    end

    # @param request [SeedExamplesClient::BasicType, SeedExamplesClient::ComplexType]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Identifier]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.create_type(request: PRIMITIVE)
    def create_type(request:, request_options: nil)
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
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      SeedExamplesClient::Identifier.from_json(json_object: response.body)
    end
  end

  class AsyncClient
    # @return [SeedExamplesClient::File::AsyncClient]
    attr_reader :file
    # @return [SeedExamplesClient::Health::AsyncClient]
    attr_reader :health
    # @return [SeedExamplesClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::AsyncClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedExamplesClient::AsyncRequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @file = SeedExamplesClient::File::AsyncClient.new(request_client: @async_request_client)
      @health = SeedExamplesClient::Health::AsyncClient.new(request_client: @async_request_client)
      @service = SeedExamplesClient::AsyncServiceClient.new(request_client: @async_request_client)
    end

    # @param request [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.echo(request: "Hello world!\n\nwith\n\tnewlines")
    def echo(request:, request_options: nil)
      response = @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/"
      end
      JSON.parse(response.body)
    end

    # @param request [SeedExamplesClient::BasicType, SeedExamplesClient::ComplexType]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Identifier]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.create_type(request: PRIMITIVE)
    def create_type(request:, request_options: nil)
      response = @async_request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@async_request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@async_request_client.get_url(request_options: request_options)}/"
      end
      SeedExamplesClient::Identifier.from_json(json_object: response.body)
    end
  end
end
