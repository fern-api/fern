# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_accept_header/service/client"

module SeedAcceptClient
  class Client
    # @return [SeedAcceptClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedAcceptClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedAcceptClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @service = SeedAcceptClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedAcceptClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedAcceptClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedAcceptClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @service = SeedAcceptClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
