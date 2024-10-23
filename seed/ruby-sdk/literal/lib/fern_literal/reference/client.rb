# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/send_request"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class ReferenceClient
    # @return [SeedLiteralClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::RequestClient]
    # @return [SeedLiteralClient::ReferenceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedLiteralClient::Reference::SendRequest, as a Hash
    #   * :prompt (String)
    #   * :query (String)
    #   * :stream (Boolean)
    #   * :context (SeedLiteralClient::Reference::SOME_LITERAL)
    #   * :maybe_context (SeedLiteralClient::Reference::SOME_LITERAL)
    #   * :container_object (Hash)
    #     * :nested_objects (Array<SeedLiteralClient::Reference::NestedObjectWithLiterals>)
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.reference.send(request: { prompt: "You are a helpful assistant", stream: false, context: "You're super wise", query: "What is the weather today", container_object: { nested_objects: [{ literal_1: "literal1", literal_2: "literal2", str_prop: "strProp" }] } })
    def send(request:, request_options: nil)
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
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/reference"
      end
      SeedLiteralClient::SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncReferenceClient
    # @return [SeedLiteralClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::AsyncRequestClient]
    # @return [SeedLiteralClient::AsyncReferenceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [Hash] Request of type SeedLiteralClient::Reference::SendRequest, as a Hash
    #   * :prompt (String)
    #   * :query (String)
    #   * :stream (Boolean)
    #   * :context (SeedLiteralClient::Reference::SOME_LITERAL)
    #   * :maybe_context (SeedLiteralClient::Reference::SOME_LITERAL)
    #   * :container_object (Hash)
    #     * :nested_objects (Array<SeedLiteralClient::Reference::NestedObjectWithLiterals>)
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.reference.send(request: { prompt: "You are a helpful assistant", stream: false, context: "You're super wise", query: "What is the weather today", container_object: { nested_objects: [{ literal_1: "literal1", literal_2: "literal2", str_prop: "strProp" }] } })
    def send(request:, request_options: nil)
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
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/reference"
        end
        SeedLiteralClient::SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
