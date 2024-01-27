# frozen_string_literal: true

module SeedCustomAuthClient
  class Client
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      request_client TODO
    end
  end

  class AsyncClient
    # @param environment [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      request_client TODO
    end
  end
end
