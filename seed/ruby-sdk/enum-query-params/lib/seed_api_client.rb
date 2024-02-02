# frozen_string_literal: true

require "faraday"
require_relative "svc/client"
require "async/http/faraday"

module SeedApiClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @svc_client = SvcClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_svc_client = AsyncSvcClient.initialize(request_client: request_client)
    end
  end
end
