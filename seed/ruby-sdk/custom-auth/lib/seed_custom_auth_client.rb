# frozen_string_literal: true

require_relative "seed_custom_auth_client/errors/types/unauthorized_request_error_body"
require "faraday"
require_relative "seed_custom_auth_client/custom_auth/client"
require "async/http/faraday"

module SeedCustomAuthClient
  class Client
    attr_reader :custom_auth_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                         custom_auth_scheme: custom_auth_scheme)
      @custom_auth_client = CustomAuth::CustomAuthClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_custom_auth_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, custom_auth_scheme: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_custom_auth_client = CustomAuth::AsyncCustomAuthClient.new(request_client: request_client)
    end
  end
end
