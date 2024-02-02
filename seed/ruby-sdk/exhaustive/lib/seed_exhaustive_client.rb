# frozen_string_literal: true

require "faraday"
require_relative "endpoints/container/client"
require_relative "endpoints/enum/client"
require_relative "endpoints/http_methods/client"
require_relative "endpoints/object/client"
require_relative "endpoints/params/client"
require_relative "endpoints/primitive/client"
require_relative "endpoints/union/client"
require_relative "endpointsclient"
require_relative "inlined_requests/client"
require_relative "no_auth/client"
require_relative "no_req_body/client"
require_relative "req_with_headers/client"
require "async/http/faraday"

module SeedExhaustiveClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @client = Client.initialize(request_client: request_client)
      @inlined_requests_client = InlinedRequestsClient.initialize(request_client: request_client)
      @no_auth_client = NoAuthClient.initialize(request_client: request_client)
      @no_req_body_client = NoReqBodyClient.initialize(request_client: request_client)
      @req_with_headers_client = ReqWithHeadersClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_client = AsyncClient.initialize(client: request_client)
      @async_inlined_requests_client = AsyncInlinedRequestsClient.initialize(request_client: request_client)
      @async_no_auth_client = AsyncNoAuthClient.initialize(request_client: request_client)
      @async_no_req_body_client = AsyncNoReqBodyClient.initialize(request_client: request_client)
      @async_req_with_headers_client = AsyncReqWithHeadersClient.initialize(request_client: request_client)
    end
  end
end
