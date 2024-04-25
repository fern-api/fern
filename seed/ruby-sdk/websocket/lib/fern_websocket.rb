# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"

module SeedWebsocketClient
  class Client
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedWebsocketClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedWebsocketClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end
  end

  class AsyncClient
    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedWebsocketClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedWebsocketClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
    end
  end
end
