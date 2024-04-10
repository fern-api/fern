# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_single_url_environment_no_default/dummy/client"

module SeedSingleUrlEnvironmentNoDefaultClient
  class Client
    # @return [SeedSingleUrlEnvironmentNoDefaultClient::DummyClient]
    attr_reader :dummy

    # @param environment [SeedSingleUrlEnvironmentNoDefaultClient::Environment]
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentNoDefaultClient::Client]
    def initialize(token:, environment: nil, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedSingleUrlEnvironmentNoDefaultClient::RequestClient.new(environment: environment,
                                                                                   base_url: base_url, max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token)
      @dummy = SeedSingleUrlEnvironmentNoDefaultClient::DummyClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedSingleUrlEnvironmentNoDefaultClient::AsyncDummyClient]
    attr_reader :dummy

    # @param environment [SeedSingleUrlEnvironmentNoDefaultClient::Environment]
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedSingleUrlEnvironmentNoDefaultClient::AsyncClient]
    def initialize(token:, environment: nil, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedSingleUrlEnvironmentNoDefaultClient::AsyncRequestClient.new(environment: environment,
                                                                                              base_url: base_url, max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token)
      @dummy = SeedSingleUrlEnvironmentNoDefaultClient::AsyncDummyClient.new(request_client: @async_request_client)
    end
  end
end
