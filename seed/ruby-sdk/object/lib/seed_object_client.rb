# frozen_string_literal: true

require_relative "seed_object_client/types/name"

require_relative "seed_object_client/types/type"
require "async/http/faraday"
require "faraday"

module SeedObjectClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
    end
  end
end
