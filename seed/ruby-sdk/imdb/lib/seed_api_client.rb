# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require "faraday"
require "faraday/retry"
require_relative "seed_api_client/imdb/client"
require "async/http/faraday"

module SeedApiClient
  class Client
    attr_reader :imdb

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          token: token)
      @imdb = ImdbClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :imdb

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     token: token)
      @imdb = AsyncImdbClient.new(request_client: @async_request_client)
    end
  end
end
