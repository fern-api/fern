# frozen_string_literal: true

require_relative "seed_literal_client/literal/types/create_options_response"
require_relative "seed_literal_client/literal/types/options"
require_relative "seed_literal_client/literal/types/undiscriminated_options"
require "faraday"
require_relative "seed_literal_client/literal/client"
require "async/http/faraday"

module SeedLiteralClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @literal_client = LiteralClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_literal_client = AsyncLiteralClient.initialize(request_client: request_client)
    end
  end
end
