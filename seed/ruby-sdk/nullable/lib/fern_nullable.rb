# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_nullable/nullable/client"

module SeedNullableClient
  class Client
    # @return [SeedNullableClient::NullableClient]
    attr_reader :nullable

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedNullableClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedNullableClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @nullable = SeedNullableClient::NullableClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedNullableClient::AsyncNullableClient]
    attr_reader :nullable

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedNullableClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedNullableClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @nullable = SeedNullableClient::AsyncNullableClient.new(request_client: @async_request_client)
    end
  end
end
