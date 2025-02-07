# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedAcceptClient
  class ServiceClient
    # @return [SeedAcceptClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedAcceptClient::RequestClient]
    # @return [SeedAcceptClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedAcceptClient::RequestOptions]
    # @return [Void]
    # @example
    #  accept = SeedAcceptClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  accept.service.endpoint
    def endpoint(request_options: nil)
      @request_client.conn.delete do |req|
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
        req.url "#{@request_client.get_url(request_options: request_options)}/container"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedAcceptClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedAcceptClient::AsyncRequestClient]
    # @return [SeedAcceptClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedAcceptClient::RequestOptions]
    # @return [Void]
    # @example
    #  accept = SeedAcceptClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  accept.service.endpoint
    def endpoint(request_options: nil)
      Async do
        @request_client.conn.delete do |req|
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
          req.url "#{@request_client.get_url(request_options: request_options)}/container"
        end
      end
    end
  end
end
