# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedBytesClient
  class ServiceClient
    # @return [SeedBytesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedBytesClient::RequestClient]
    # @return [SeedBytesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, IO] Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)
    # @param request_options [SeedBytesClient::RequestOptions]
    # @return [Void]
    def upload(request:, request_options: nil)
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
        req.headers["Content-Type"] = "application/octet-stream"
        req.body = request
        req.url "#{@request_client.get_url(request_options: request_options)}/upload-content"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedBytesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedBytesClient::AsyncRequestClient]
    # @return [SeedBytesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, IO] Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)
    # @param request_options [SeedBytesClient::RequestOptions]
    # @return [Void]
    def upload(request:, request_options: nil)
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
          req.headers["Content-Type"] = "application/octet-stream"
          req.body = request
          req.url "#{@request_client.get_url(request_options: request_options)}/upload-content"
        end
      end
    end
  end
end
