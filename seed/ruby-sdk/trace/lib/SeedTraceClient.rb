# frozen_string_literal: true

module SeedTraceClient
  class Client
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return []
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token: nil,
                   x_random_header: nil)
      request_client TODO
    end
  end

  class AsyncClient
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return []
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token: nil,
                   x_random_header: nil)
      request_client TODO
    end
  end
end
