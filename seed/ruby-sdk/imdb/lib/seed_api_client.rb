# frozen_string_literal: true

require_relative "seed_api_client/imdb/types/movie"

require_relative "seed_api_client/imdb/types/create_movie_request"
require_relative "seed_api_client/imdb/types/movie_id"
require "faraday"
require_relative "seed_api_client/imdb/client"
require "async/http/faraday"

module SeedApiClient
  class Client
    attr_reader :imdb_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token)
      @imdb_client = Imdb::ImdbClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_imdb_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_imdb_client = Imdb::AsyncImdbClient.new(request_client: request_client)
    end
  end
end
