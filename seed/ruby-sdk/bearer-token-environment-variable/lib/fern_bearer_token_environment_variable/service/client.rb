# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedBearerTokenEnvironmentVariableClient
  class ServiceClient
    # @return [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBearerTokenEnvironmentVariableClient::RequestClient]
    # @return [SeedBearerTokenEnvironmentVariableClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom api key
    #
    # @param request_options [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    # @return [String]
    # @example
    #  bearer_token_environment_variable = SeedBearerTokenEnvironmentVariableClient::Client.new(base_url: "https://api.example.com", api_key: "YOUR_AUTH_TOKEN")
    #  bearer_token_environment_variable.service.get_with_bearer_token
    def get_with_bearer_token(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
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
        req.url "#{@request_client.get_url(request_options: request_options)}/apiKey"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBearerTokenEnvironmentVariableClient::AsyncRequestClient]
    # @return [SeedBearerTokenEnvironmentVariableClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # GET request with custom api key
    #
    # @param request_options [SeedBearerTokenEnvironmentVariableClient::RequestOptions]
    # @return [String]
    # @example
    #  bearer_token_environment_variable = SeedBearerTokenEnvironmentVariableClient::Client.new(base_url: "https://api.example.com", api_key: "YOUR_AUTH_TOKEN")
    #  bearer_token_environment_variable.service.get_with_bearer_token
    def get_with_bearer_token(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.api_key unless request_options&.api_key.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/apiKey"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
