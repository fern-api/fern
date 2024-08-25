# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/some_aliased_literal"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class InlinedClient
    # @return [SeedLiteralClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::RequestClient]
    # @return [SeedLiteralClient::InlinedClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param temperature [Float]
    # @param aliased_context [SeedLiteralClient::Inlined::SOME_ALIASED_LITERAL]
    # @param maybe_context [SeedLiteralClient::Inlined::SOME_ALIASED_LITERAL]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.inlined.send(
    #    query: "What is the weather today",
    #    temperature: 10.1,
    #    aliased_context: "You're super wise",
    #    maybe_context: "You're super wise"
    #  )
    def send(query:, aliased_context:, temperature: nil, maybe_context: nil, request_options: nil)
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
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          "prompt": "You are a helpful assistant",
          "context": "You're super wise",
          "stream": false,
          query: query,
          temperature: temperature,
          aliasedContext: aliased_context,
          maybeContext: maybe_context
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/inlined"
      end
      SeedLiteralClient::SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncInlinedClient
    # @return [SeedLiteralClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::AsyncRequestClient]
    # @return [SeedLiteralClient::AsyncInlinedClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param query [String]
    # @param temperature [Float]
    # @param aliased_context [SeedLiteralClient::Inlined::SOME_ALIASED_LITERAL]
    # @param maybe_context [SeedLiteralClient::Inlined::SOME_ALIASED_LITERAL]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.inlined.send(
    #    query: "What is the weather today",
    #    temperature: 10.1,
    #    aliased_context: "You're super wise",
    #    maybe_context: "You're super wise"
    #  )
    def send(query:, aliased_context:, temperature: nil, maybe_context: nil, request_options: nil)
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
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            "prompt": "You are a helpful assistant",
            "context": "You're super wise",
            "stream": false,
            query: query,
            temperature: temperature,
            aliasedContext: aliased_context,
            maybeContext: maybe_context
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/inlined"
        end
        SeedLiteralClient::SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
