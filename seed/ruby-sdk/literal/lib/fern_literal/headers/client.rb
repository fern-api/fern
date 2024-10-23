# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class HeadersClient
    # @return [SeedLiteralClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::RequestClient]
    # @return [SeedLiteralClient::HeadersClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.headers.send(query: "What is the weather today")
    def send(query:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
        unless request_options&.audit_logging.nil?
          req.headers["X-API-Enable-Audit-Logging"] =
            request_options.audit_logging
        end
        req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {}),
          "X-Endpoint-Version": "02-12-2024",
          "X-Async": true
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/headers"
      end
      SeedLiteralClient::SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncHeadersClient
    # @return [SeedLiteralClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::AsyncRequestClient]
    # @return [SeedLiteralClient::AsyncHeadersClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.headers.send(query: "What is the weather today")
    def send(query:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
          unless request_options&.audit_logging.nil?
            req.headers["X-API-Enable-Audit-Logging"] =
              request_options.audit_logging
          end
          req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {}),
            "X-Endpoint-Version": "02-12-2024",
            "X-Async": true
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}), query: query }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/headers"
        end
        SeedLiteralClient::SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
