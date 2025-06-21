# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedContentTypesClient
  class ServiceClient
    # @return [SeedContentTypesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedContentTypesClient::RequestClient]
    # @return [SeedContentTypesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param application [String]
    # @param require_auth [Boolean]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch(application: "application", require_auth: true)
    def patch(application: nil, require_auth: nil, request_options: nil)
      @request_client.conn.patch do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          application: application,
          require_auth: require_auth
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedContentTypesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedContentTypesClient::AsyncRequestClient]
    # @return [SeedContentTypesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param application [String]
    # @param require_auth [Boolean]
    # @param request_options [SeedContentTypesClient::RequestOptions]
    # @return [Void]
    # @example
    #  content_types = SeedContentTypesClient::Client.new(base_url: "https://api.example.com")
    #  content_types.service.patch(application: "application", require_auth: true)
    def patch(application: nil, require_auth: nil, request_options: nil)
      Async do
        @request_client.conn.patch do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            application: application,
            require_auth: require_auth
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end
  end
end
