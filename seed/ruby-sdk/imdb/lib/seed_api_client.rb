# frozen_string_literal: true

require_relative "seed_api_client/imdb/types/movie"

require_relative "seed_api_client/imdb/types/create_movie_request"
require_relative "seed_api_client/imdb/types/movie_id"
require "faraday"
require_relative "seed_api_client/imdb/client"
require "async/http/faraday"

module SeedApiClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @imdb_client = ImdbClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_imdb_client = AsyncImdbClient.initialize(request_client: request_client)
    end
  end
end
