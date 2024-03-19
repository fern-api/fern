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
    attr_reader :headers, :inlined, :path, :query, :reference

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [Client]
    def initialize(version:, audit_logging:, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          version: version, audit_logging: audit_logging)
      @headers = HeadersClient.new(request_client: @request_client)
      @inlined = InlinedClient.new(request_client: @request_client)
      @path = PathClient.new(request_client: @request_client)
      @query = QueryClient.new(request_client: @request_client)
      @reference = ReferenceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :headers, :inlined, :path, :query, :reference

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param version [String]
    # @param audit_logging [Boolean]
    # @return [AsyncClient]
    def initialize(version:, audit_logging:, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     version: version, audit_logging: audit_logging)
      @headers = AsyncHeadersClient.new(request_client: @async_request_client)
      @inlined = AsyncInlinedClient.new(request_client: @async_request_client)
      @path = AsyncPathClient.new(request_client: @async_request_client)
      @query = AsyncQueryClient.new(request_client: @async_request_client)
      @reference = AsyncReferenceClient.new(request_client: @async_request_client)
    end
  end
end
