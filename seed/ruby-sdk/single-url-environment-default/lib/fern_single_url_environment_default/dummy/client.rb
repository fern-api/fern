# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedSingleUrlEnvironmentDefaultClient
  class DummyClient
    # @return [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedSingleUrlEnvironmentDefaultClient::RequestClient]
    # @return [SeedSingleUrlEnvironmentDefaultClient::DummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @return [String]
    # @example
    #  single_url_environment_default = SeedSingleUrlEnvironmentDefaultClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedSingleUrlEnvironmentDefaultClient::Environment::PRODUCTION,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  single_url_environment_default.dummy.get_dummy
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
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient]
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncDummyClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedSingleUrlEnvironmentDefaultClient::RequestOptions]
    # @return [String]
    # @example
    #  single_url_environment_default = SeedSingleUrlEnvironmentDefaultClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedSingleUrlEnvironmentDefaultClient::Environment::PRODUCTION,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  single_url_environment_default.dummy.get_dummy
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
