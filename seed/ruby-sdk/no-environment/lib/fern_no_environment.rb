# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_no_environment/dummy/client"

module SeedNoEnvironmentClient
  class Client
    # @return [SeedNoEnvironmentClient::DummyClient]
    attr_reader :dummy

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedNoEnvironmentClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedNoEnvironmentClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @dummy = SeedNoEnvironmentClient::DummyClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedNoEnvironmentClient::AsyncDummyClient]
    attr_reader :dummy

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedNoEnvironmentClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedNoEnvironmentClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @dummy = SeedNoEnvironmentClient::AsyncDummyClient.new(request_client: @async_request_client)
    end
  end
end
