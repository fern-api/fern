# frozen_string_literal: true

require_relative "../../requests"
require "json"
require "async"

module SeedExhaustiveClient
  class NoAuthClient
    # @return [SeedExhaustiveClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::RequestClient]
    # @return [SeedExhaustiveClient::NoAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # POST request with no auth
    #
    # @param request [Object]
    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_auth.post_with_no_auth(request: {"key":"value"})
    def post_with_no_auth(request: nil, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/no-auth"
      end
      JSON.parse(response.body)
    end
  end

  class AsyncNoAuthClient
    # @return [SeedExhaustiveClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
    # @return [SeedExhaustiveClient::AsyncNoAuthClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # POST request with no auth
    #
    # @param request [Object]
    # @param request_options [SeedExhaustiveClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  exhaustive = SeedExhaustiveClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  exhaustive.no_auth.post_with_no_auth(request: {"key":"value"})
    def post_with_no_auth(request: nil, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/no-auth"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
