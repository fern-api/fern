# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/types/extended_movie"
require_relative "../types/types/test"
require "async"

module SeedExamplesClient
  class ServiceClient
    # @return [SeedExamplesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::RequestClient]
    # @return [SeedExamplesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::ExtendedMovie, as a Hash
    #   * :cast (Array<String>)
    #   * :foo (String)
    #   * :bar (Integer)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Test]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_movie(request: { foo: "foo", bar: 1, cast: ["cast", "cast"] })
    def get_movie(request:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      SeedExamplesClient::Types::Test.from_json(json_object: response.body)
    end

    # @param request [SeedExamplesClient::Types::Test]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Test]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_big_entity
    def create_big_entity(request:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/big-entity"
      end
      SeedExamplesClient::Types::Test.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedExamplesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::AsyncRequestClient]
    # @return [SeedExamplesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::ExtendedMovie, as a Hash
    #   * :cast (Array<String>)
    #   * :foo (String)
    #   * :bar (Integer)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Test]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_movie(request: { foo: "foo", bar: 1, cast: ["cast", "cast"] })
    def get_movie(request:, request_options: nil)
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
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        SeedExamplesClient::Types::Test.from_json(json_object: response.body)
      end
    end

    # @param request [SeedExamplesClient::Types::Test]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Test]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_big_entity
    def create_big_entity(request:, request_options: nil)
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
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/big-entity"
        end
        SeedExamplesClient::Types::Test.from_json(json_object: response.body)
      end
    end
  end
end
