# frozen_string_literal: true

module SeedLiteralHeadersClient
  class Client
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return []
    def initialize(api_header:, api_test:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      request_client TODO
    end
  end

  class AsyncClient
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param api_header [String]
    # @param api_test [Boolean]
    # @return []
    def initialize(api_header:, api_test:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      request_client TODO
    end
  end
end
