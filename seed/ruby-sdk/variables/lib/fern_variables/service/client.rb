# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedVariablesClient
  class ServiceClient
    # @return [SeedVariablesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedVariablesClient::RequestClient]
    # @return [SeedVariablesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param endpoint_param [String]
    # @param request_options [SeedVariablesClient::RequestOptions]
    # @return [Void]
    # @example
    #  variables = SeedVariablesClient::Client.new(base_url: "https://api.example.com")
    #  variables.service.post(endpoint_param: "endpointParam")
    def post(endpoint_param:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
        req.url "#{@request_client.get_url(request_options: request_options)}/#{endpoint_param}"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedVariablesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedVariablesClient::AsyncRequestClient]
    # @return [SeedVariablesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param endpoint_param [String]
    # @param request_options [SeedVariablesClient::RequestOptions]
    # @return [Void]
    # @example
    #  variables = SeedVariablesClient::Client.new(base_url: "https://api.example.com")
    #  variables.service.post(endpoint_param: "endpointParam")
    def post(endpoint_param:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
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
          req.url "#{@request_client.get_url(request_options: request_options)}/#{endpoint_param}"
        end
      end
    end
  end
end
