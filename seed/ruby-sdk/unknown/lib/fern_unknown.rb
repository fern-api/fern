# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_unknown/unknown/client"

module SeedUnknownAsAnyClient
  class Client
    # @return [SeedUnknownAsAnyClient::UnknownClient]
    attr_reader :unknown

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedUnknownAsAnyClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedUnknownAsAnyClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @unknown = SeedUnknownAsAnyClient::UnknownClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedUnknownAsAnyClient::AsyncUnknownClient]
    attr_reader :unknown

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedUnknownAsAnyClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedUnknownAsAnyClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @unknown = SeedUnknownAsAnyClient::AsyncUnknownClient.new(request_client: @async_request_client)
    end
  end
end
