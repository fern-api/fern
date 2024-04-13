# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_literal/headers/client"
require_relative "fern_literal/inlined/client"
require_relative "fern_literal/path/client"
require_relative "fern_literal/query/client"
require_relative "fern_literal/reference/client"

module SeedLiteralClient
  class Client
    # @return [SeedLiteralClient::HeadersClient]
    attr_reader :headers
    # @return [SeedLiteralClient::InlinedClient]
    attr_reader :inlined
    # @return [SeedLiteralClient::PathClient]
    attr_reader :path
    # @return [SeedLiteralClient::QueryClient]
    attr_reader :query
    # @return [SeedLiteralClient::ReferenceClient]
    attr_reader :reference

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [SeedLiteralClient::Client]
    def initialize(version:, audit_logging:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedLiteralClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        version: version,
        audit_logging: audit_logging
      )
      @headers = SeedLiteralClient::HeadersClient.new(request_client: @request_client)
      @inlined = SeedLiteralClient::InlinedClient.new(request_client: @request_client)
      @path = SeedLiteralClient::PathClient.new(request_client: @request_client)
      @query = SeedLiteralClient::QueryClient.new(request_client: @request_client)
      @reference = SeedLiteralClient::ReferenceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedLiteralClient::AsyncHeadersClient]
    attr_reader :headers
    # @return [SeedLiteralClient::AsyncInlinedClient]
    attr_reader :inlined
    # @return [SeedLiteralClient::AsyncPathClient]
    attr_reader :path
    # @return [SeedLiteralClient::AsyncQueryClient]
    attr_reader :query
    # @return [SeedLiteralClient::AsyncReferenceClient]
    attr_reader :reference

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [SeedLiteralClient::AsyncClient]
    def initialize(version:, audit_logging:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedLiteralClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        version: version,
        audit_logging: audit_logging
      )
      @headers = SeedLiteralClient::AsyncHeadersClient.new(request_client: @async_request_client)
      @inlined = SeedLiteralClient::AsyncInlinedClient.new(request_client: @async_request_client)
      @path = SeedLiteralClient::AsyncPathClient.new(request_client: @async_request_client)
      @query = SeedLiteralClient::AsyncQueryClient.new(request_client: @async_request_client)
      @reference = SeedLiteralClient::AsyncReferenceClient.new(request_client: @async_request_client)
    end
  end
end
