# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class HeadersClient
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::RequestClient]
    # @return [SeedLiteralClient::HeadersClient]
    def initialize(request_client:)
      # @type [SeedLiteralClient::RequestClient]
      @request_client = request_client
    end

    # @param endpoint_version [String]
    # @param async [Boolean]
    # @param query [String]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    def send(endpoint_version:, async:, query:, request_options: nil)
      response = @request_client.conn.post("/headers") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
        unless request_options&.audit_logging.nil?
          req.headers["X-API-Enable-Audit-Logging"] =
            request_options.audit_logging
        end
        req.headers = {
          **req.headers,
          **(request_options&.additional_headers || {}),
          "X-Endpoint-Version": endpoint_version,
          "X-Async": async
        }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/headers"
      end
      SeedLiteralClient::SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncHeadersClient
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::AsyncRequestClient]
    # @return [SeedLiteralClient::AsyncHeadersClient]
    def initialize(request_client:)
      # @type [SeedLiteralClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param endpoint_version [String]
    # @param async [Boolean]
    # @param query [String]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    def send(endpoint_version:, async:, query:, request_options: nil)
      Async do
        response = @request_client.conn.post("/headers") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
          unless request_options&.audit_logging.nil?
            req.headers["X-API-Enable-Audit-Logging"] =
              request_options.audit_logging
          end
          req.headers = {
            **req.headers,
            **(request_options&.additional_headers || {}),
            "X-Endpoint-Version": endpoint_version,
            "X-Async": async
          }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/headers"
        end
        SeedLiteralClient::SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
