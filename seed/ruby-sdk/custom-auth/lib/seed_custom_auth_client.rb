# frozen_string_literal: true

require "faraday"
require_relative "custom_auth/client"
require "async/http/faraday"

module SeedCustomAuthClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @custom_auth_client = CustomAuthClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_custom_auth_client = AsyncCustomAuthClient.initialize(request_client: request_client)
    end
  end
end
