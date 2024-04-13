# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_basic_auth/basic_auth/client"

module SeedBasicAuthClient
  class Client
    # @return [SeedBasicAuthClient::BasicAuthClient]
    attr_reader :basic_auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthClient::Client]
    def initialize(username:, password:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedBasicAuthClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        username: username,
        password: password
      )
      @basic_auth = SeedBasicAuthClient::BasicAuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedBasicAuthClient::AsyncBasicAuthClient]
    attr_reader :basic_auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @return [SeedBasicAuthClient::AsyncClient]
    def initialize(username:, password:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedBasicAuthClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        username: username,
        password: password
      )
      @basic_auth = SeedBasicAuthClient::AsyncBasicAuthClient.new(request_client: @async_request_client)
    end
  end
end
