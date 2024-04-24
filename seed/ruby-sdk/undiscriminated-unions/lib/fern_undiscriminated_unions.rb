# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_undiscriminated_unions/union/client"

module SeedUndiscriminatedUnionsClient
  class Client
    # @return [SeedUndiscriminatedUnionsClient::UnionClient]
    attr_reader :union

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedUndiscriminatedUnionsClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedUndiscriminatedUnionsClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @union = SeedUndiscriminatedUnionsClient::UnionClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedUndiscriminatedUnionsClient::AsyncUnionClient]
    attr_reader :union

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedUndiscriminatedUnionsClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedUndiscriminatedUnionsClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @union = SeedUndiscriminatedUnionsClient::AsyncUnionClient.new(request_client: @async_request_client)
    end
  end
end
