# frozen_string_literal: true

require_relative "seed_unknown_as_any_client/unknown/types/my_alias"
require_relative "seed_unknown_as_any_client/unknown/types/my_object"
require "faraday"
require_relative "seed_unknown_as_any_client/unknown/client"
require "async/http/faraday"

module SeedUnknownAsAnyClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @unknown_client = UnknownClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_unknown_client = AsyncUnknownClient.initialize(request_client: request_client)
    end
  end
end
