# frozen_string_literal: true

require "faraday"
require_relative "inlined_request/client"
require_relative "path_param/client"
require_relative "query_param/client"
require "async/http/faraday"

module SeedEnumClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @inlined_request_client = InlinedRequestClient.initialize(request_client: request_client)
      @path_param_client = PathParamClient.initialize(request_client: request_client)
      @query_param_client = QueryParamClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_inlined_request_client = AsyncInlinedRequestClient.initialize(request_client: request_client)
      @async_path_param_client = AsyncPathParamClient.initialize(request_client: request_client)
      @async_query_param_client = AsyncQueryParamClient.initialize(request_client: request_client)
    end
  end
end
