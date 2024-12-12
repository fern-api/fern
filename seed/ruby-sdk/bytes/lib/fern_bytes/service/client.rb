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

    # @param request_options [SeedBytesClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    def download(request_options: nil, &on_data)
      @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.options.on_data = on_data
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/download-content"
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

    # @param request_options [SeedBytesClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    def download(request_options: nil, &on_data)
      Async do
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.options.on_data = on_data
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/download-content"
        end
      end
    end
  end
end
