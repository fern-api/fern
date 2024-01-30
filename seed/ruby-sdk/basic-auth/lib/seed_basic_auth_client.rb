# frozen_string_literal: true

require "faraday"
require_relative "basic_auth/client"
require "async/http/faraday"

module SeedBasicAuthClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, username: nil, password: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @basic_auth_client = BasicAuthClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, username: nil, password: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_basic_auth_client = AsyncBasicAuthClient.initialize(request_client: request_client)
    end
  end
end
