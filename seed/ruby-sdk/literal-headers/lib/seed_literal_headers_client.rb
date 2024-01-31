# frozen_string_literal: true

require "faraday"
require_relative "no_headers/client"
require_relative "only_literal_headers/client"
require_relative "with_non_literal_headers/client"
require "async/http/faraday"

module SeedLiteralHeadersClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return []
    def initialize(api_header:, api_test:, max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @no_headers_client = NoHeadersClient.initialize(request_client: request_client)
      @only_literal_headers_client = OnlyLiteralHeadersClient.initialize(request_client: request_client)
      @with_non_literal_headers_client = WithNonLiteralHeadersClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return []
    def initialize(api_header:, api_test:, max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_no_headers_client = AsyncNoHeadersClient.initialize(request_client: request_client)
      @async_only_literal_headers_client = AsyncOnlyLiteralHeadersClient.initialize(request_client: request_client)
      @async_with_non_literal_headers_client = AsyncWithNonLiteralHeadersClient.initialize(request_client: request_client)
    end
  end
end
