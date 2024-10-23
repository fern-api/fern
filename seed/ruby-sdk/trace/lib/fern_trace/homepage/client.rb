# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedTraceClient
  class HomepageClient
    # @return [SeedTraceClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::HomepageClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<String>]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.homepage.get_homepage_problems
    def get_homepage_problems(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
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
        req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
      end
      JSON.parse(response.body)
    end

    # @param request [Array<String>]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.homepage.set_homepage_problems(request: ["string", "string"])
    def set_homepage_problems(request:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
      end
    end
  end

  class AsyncHomepageClient
    # @return [SeedTraceClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncHomepageClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<String>]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.homepage.get_homepage_problems
    def get_homepage_problems(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request [Array<String>]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.homepage.set_homepage_problems(request: ["string", "string"])
    def set_homepage_problems(request:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
        end
      end
    end
  end
end
