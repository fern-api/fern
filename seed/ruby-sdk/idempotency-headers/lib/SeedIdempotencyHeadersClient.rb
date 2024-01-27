# frozen_string_literal: true

module SeedIdempotencyHeadersClient
  class Client
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client TODO
    end
  end

  class AsyncClient
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client TODO
    end
  end
end
