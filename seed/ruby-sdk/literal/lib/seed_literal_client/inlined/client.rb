# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class InlinedClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [InlinedClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param prompt [String]
    # @param query [String]
    # @param temperature [Float]
    # @param stream [Boolean]
    # @param request_options [RequestOptions]
    # @return [SendResponse]
    def send(prompt:, query:, stream:, temperature: nil, request_options: nil)
      response = @request_client.conn.post("/inlined") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
        unless request_options&.audit_logging.nil?
          req.headers["X-API-Enable-Audit-Logging"] =
            request_options.audit_logging
        end
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          prompt: prompt,
          query: query,
          temperature: temperature,
          stream: stream
        }.compact
      end
      SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncInlinedClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncInlinedClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param prompt [String]
    # @param query [String]
    # @param temperature [Float]
    # @param stream [Boolean]
    # @param request_options [RequestOptions]
    # @return [SendResponse]
    def send(prompt:, query:, stream:, temperature: nil, request_options: nil)
      Async do
        response = @request_client.conn.post("/inlined") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["X-API-Version"] = request_options.version unless request_options&.version.nil?
          unless request_options&.audit_logging.nil?
            req.headers["X-API-Enable-Audit-Logging"] =
              request_options.audit_logging
          end
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            prompt: prompt,
            query: query,
            temperature: temperature,
            stream: stream
          }.compact
        end
        SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
