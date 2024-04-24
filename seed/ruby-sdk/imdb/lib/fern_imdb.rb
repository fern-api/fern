# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_imdb/imdb/client"

module SeedApiClient
  class Client
    # @return [SeedApiClient::ImdbClient]
    attr_reader :imdb

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedApiClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedApiClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @imdb = SeedApiClient::ImdbClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedApiClient::AsyncImdbClient]
    attr_reader :imdb

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedApiClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedApiClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @imdb = SeedApiClient::AsyncImdbClient.new(request_client: @async_request_client)
    end
  end
end
