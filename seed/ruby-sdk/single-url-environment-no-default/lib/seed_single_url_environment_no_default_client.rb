# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "seed_single_url_environment_no_default_client/dummy/client"

module SeedSingleUrlEnvironmentNoDefaultClient
  class Client
    attr_reader :dummy

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(token:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(environment: environment, max_retries: max_retries,
                                          timeout_in_seconds: timeout_in_seconds, token: token)
      @dummy = DummyClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :dummy

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(token:, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(environment: environment, max_retries: max_retries,
                                                     timeout_in_seconds: timeout_in_seconds, token: token)
      @dummy = AsyncDummyClient.new(request_client: @async_request_client)
    end
  end
end
