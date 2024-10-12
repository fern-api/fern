# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedApiWideBasePathClient
  class ServiceClient
    # @return [SeedApiWideBasePathClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiWideBasePathClient::RequestClient]
    # @return [SeedApiWideBasePathClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param path_param [String]
    # @param service_param [String]
    # @param resource_param [String]
    # @param endpoint_param [Integer]
    # @param request_options [SeedApiWideBasePathClient::RequestOptions]
    # @return [Void]
    # @example
    #  api_wide_base_path = SeedApiWideBasePathClient::Client.new(base_url: "https://api.example.com")
    #  api_wide_base_path.service.post(
    #    path_param: "pathParam",
    #    service_param: "serviceParam",
    #    resource_param: "resourceParam",
    #    endpoint_param: 1
    #  )
    def post(path_param:, service_param:, resource_param:, endpoint_param:, request_options: nil)
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
        req.url "#{@request_client.get_url(request_options: request_options)}/test/#{path_param}/#{service_param}/#{resource_param}/#{endpoint_param}"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedApiWideBasePathClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedApiWideBasePathClient::AsyncRequestClient]
    # @return [SeedApiWideBasePathClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param path_param [String]
    # @param service_param [String]
    # @param resource_param [String]
    # @param endpoint_param [Integer]
    # @param request_options [SeedApiWideBasePathClient::RequestOptions]
    # @return [Void]
    # @example
    #  api_wide_base_path = SeedApiWideBasePathClient::Client.new(base_url: "https://api.example.com")
    #  api_wide_base_path.service.post(
    #    path_param: "pathParam",
    #    service_param: "serviceParam",
    #    resource_param: "resourceParam",
    #    endpoint_param: 1
    #  )
    def post(path_param:, service_param:, resource_param:, endpoint_param:, request_options: nil)
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
          req.url "#{@request_client.get_url(request_options: request_options)}/test/#{path_param}/#{service_param}/#{resource_param}/#{endpoint_param}"
        end
      end
    end
  end
end
