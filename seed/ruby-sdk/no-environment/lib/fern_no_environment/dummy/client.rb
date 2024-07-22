# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedNoEnvironmentClient
  class DummyClient
    # @return [SeedNoEnvironmentClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedNoEnvironmentClient::RequestClient]
    # @return [SeedNoEnvironmentClient::DummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedNoEnvironmentClient::RequestOptions]
    # @return [String]
    # @example
    #  no_environment = SeedNoEnvironmentClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  no_environment.dummy.get_dummy
    def get_dummy(request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/dummy"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncDummyClient
    # @return [SeedNoEnvironmentClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedNoEnvironmentClient::AsyncRequestClient]
    # @return [SeedNoEnvironmentClient::AsyncDummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedNoEnvironmentClient::RequestOptions]
    # @return [String]
    # @example
    #  no_environment = SeedNoEnvironmentClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  no_environment.dummy.get_dummy
    def get_dummy(request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/dummy"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
