# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_custom_auth/custom_auth/client"

module SeedCustomAuthClient
  class Client
    # @return [SeedCustomAuthClient::CustomAuthClient]
    attr_reader :custom_auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [SeedCustomAuthClient::Client]
    def initialize(custom_auth_scheme:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedCustomAuthClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        custom_auth_scheme: custom_auth_scheme
      )
      @custom_auth = SeedCustomAuthClient::CustomAuthClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedCustomAuthClient::AsyncCustomAuthClient]
    attr_reader :custom_auth

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @return [SeedCustomAuthClient::AsyncClient]
    def initialize(custom_auth_scheme:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedCustomAuthClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        custom_auth_scheme: custom_auth_scheme
      )
      @custom_auth = SeedCustomAuthClient::AsyncCustomAuthClient.new(request_client: @async_request_client)
    end
  end
end
