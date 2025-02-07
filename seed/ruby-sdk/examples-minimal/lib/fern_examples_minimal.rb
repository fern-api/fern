# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_examples_minimal/service/client"

module SeedExamplesClient
  class Client
    # @return [SeedExamplesClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::Client]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedExamplesClient::RequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @service = SeedExamplesClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedExamplesClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param environment [SeedExamplesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExamplesClient::AsyncClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedExamplesClient::AsyncRequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @service = SeedExamplesClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
