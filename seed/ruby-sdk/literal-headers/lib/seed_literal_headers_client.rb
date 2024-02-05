# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require "faraday"
require "faraday/retry"
require_relative "seed_literal_headers_client/no_headers/client"
require_relative "seed_literal_headers_client/only_literal_headers/client"
require_relative "seed_literal_headers_client/with_non_literal_headers/client"
require "async/http/faraday"

module SeedLiteralHeadersClient
  class Client
    attr_reader :no_headers, :only_literal_headers, :with_non_literal_headers

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return [Client]
    def initialize(api_header:, api_test:, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          api_header: api_header, api_test: api_test)
      @no_headers = NoHeadersClient.new(request_client: @request_client)
      @only_literal_headers = OnlyLiteralHeadersClient.new(request_client: @request_client)
      @with_non_literal_headers = WithNonLiteralHeadersClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :no_headers, :only_literal_headers, :with_non_literal_headers

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return [AsyncClient]
    def initialize(api_header:, api_test:, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     api_header: api_header, api_test: api_test)
      @no_headers = AsyncNoHeadersClient.new(request_client: @async_request_client)
      @only_literal_headers = AsyncOnlyLiteralHeadersClient.new(request_client: @async_request_client)
      @with_non_literal_headers = AsyncWithNonLiteralHeadersClient.new(request_client: @async_request_client)
    end
  end
end
