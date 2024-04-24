# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_single_url_environment_default/dummy/client"

module SeedSingleUrlEnvironmentDefaultClient
  class Client
    # @return [SeedSingleUrlEnvironmentDefaultClient::DummyClient]
    attr_reader :dummy

    # @param environment [SeedSingleUrlEnvironmentDefaultClient::Environment]
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentDefaultClient::Client]
    def initialize(token:, environment: Environment::PRODUCTION, base_url: nil, max_retries: nil,
                   timeout_in_seconds: nil)
      @request_client = SeedSingleUrlEnvironmentDefaultClient::RequestClient.new(
        environment: environment,
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @dummy = SeedSingleUrlEnvironmentDefaultClient::DummyClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncDummyClient]
    attr_reader :dummy

    # @param environment [SeedSingleUrlEnvironmentDefaultClient::Environment]
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentDefaultClient::AsyncClient]
    def initialize(token:, environment: Environment::PRODUCTION, base_url: nil, max_retries: nil,
                   timeout_in_seconds: nil)
      @async_request_client = SeedSingleUrlEnvironmentDefaultClient::AsyncRequestClient.new(
        environment: environment,
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @dummy = SeedSingleUrlEnvironmentDefaultClient::AsyncDummyClient.new(request_client: @async_request_client)
    end
  end
end
