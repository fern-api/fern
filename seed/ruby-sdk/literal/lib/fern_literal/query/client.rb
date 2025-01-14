# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/alias_to_prompt"
require_relative "types/alias_to_stream"
require_relative "../types/send_response"
require "async"

module SeedLiteralClient
  class QueryClient
    # @return [SeedLiteralClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::RequestClient]
    # @return [SeedLiteralClient::QueryClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param optional_prompt [String]
    # @param alias_prompt [SeedLiteralClient::Query::ALIAS_TO_PROMPT]
    # @param alias_optional_prompt [SeedLiteralClient::Query::ALIAS_TO_PROMPT]
    # @param query [String]
    # @param optional_stream [Boolean]
    # @param alias_stream [SeedLiteralClient::Query::ALIAS_TO_STREAM]
    # @param alias_optional_stream [SeedLiteralClient::Query::ALIAS_TO_STREAM]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.query.send(
    #    optional_prompt: "You are a helpful assistant",
    #    alias_prompt: "You are a helpful assistant",
    #    alias_optional_prompt: "You are a helpful assistant",
    #    query: "What is the weather today",
    #    optional_stream: false,
    #    alias_stream: false,
    #    alias_optional_stream: false
    #  )
    def send(alias_prompt:, query:, alias_stream:, optional_prompt: nil, alias_optional_prompt: nil,
             optional_stream: nil, alias_optional_stream: nil, request_options: nil)
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
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "prompt": "You are a helpful assistant",
          "stream": false,
          "optional_prompt": optional_prompt,
          "alias_prompt": alias_prompt,
          "alias_optional_prompt": alias_optional_prompt,
          "query": query,
          "optional_stream": optional_stream,
          "alias_stream": alias_stream,
          "alias_optional_stream": alias_optional_stream
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/query"
      end
      SeedLiteralClient::SendResponse.from_json(json_object: response.body)
    end
  end

  class AsyncQueryClient
    # @return [SeedLiteralClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedLiteralClient::AsyncRequestClient]
    # @return [SeedLiteralClient::AsyncQueryClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param optional_prompt [String]
    # @param alias_prompt [SeedLiteralClient::Query::ALIAS_TO_PROMPT]
    # @param alias_optional_prompt [SeedLiteralClient::Query::ALIAS_TO_PROMPT]
    # @param query [String]
    # @param optional_stream [Boolean]
    # @param alias_stream [SeedLiteralClient::Query::ALIAS_TO_STREAM]
    # @param alias_optional_stream [SeedLiteralClient::Query::ALIAS_TO_STREAM]
    # @param request_options [SeedLiteralClient::RequestOptions]
    # @return [SeedLiteralClient::SendResponse]
    # @example
    #  literal = SeedLiteralClient::Client.new(
    #    base_url: "https://api.example.com",
    #    version: "Version",
    #    audit_logging: "AuditLogging"
    #  )
    #  literal.query.send(
    #    optional_prompt: "You are a helpful assistant",
    #    alias_prompt: "You are a helpful assistant",
    #    alias_optional_prompt: "You are a helpful assistant",
    #    query: "What is the weather today",
    #    optional_stream: false,
    #    alias_stream: false,
    #    alias_optional_stream: false
    #  )
    def send(alias_prompt:, query:, alias_stream:, optional_prompt: nil, alias_optional_prompt: nil,
             optional_stream: nil, alias_optional_stream: nil, request_options: nil)
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
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "prompt": "You are a helpful assistant",
            "stream": false,
            "optional_prompt": optional_prompt,
            "alias_prompt": alias_prompt,
            "alias_optional_prompt": alias_optional_prompt,
            "query": query,
            "optional_stream": optional_stream,
            "alias_stream": alias_stream,
            "alias_optional_stream": alias_optional_stream
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/query"
        end
        SeedLiteralClient::SendResponse.from_json(json_object: response.body)
      end
    end
  end
end
