# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require "faraday"
require "faraday/retry"
require_relative "seed_custom_auth_client/custom_auth/client"
require "async/http/faraday"

module SeedCustomAuthClient
  class Client
    attr_reader :custom_auth

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          custom_auth_scheme: custom_auth_scheme)
      @custom_auth = CustomAuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :custom_auth

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     custom_auth_scheme: custom_auth_scheme)
      @custom_auth = AsyncCustomAuthClient.new(request_client: @async_request_client)
    end
  end
end
