# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_exhaustive_client/endpoints/client"
require_relative "seed_exhaustive_client/inlined_requests/client"
require_relative "seed_exhaustive_client/no_auth/client"
require_relative "seed_exhaustive_client/no_req_body/client"
require_relative "seed_exhaustive_client/req_with_headers/client"

module SeedExhaustiveClient
  class Client
    attr_reader :endpoints, :inlined_requests, :no_auth, :no_req_body, :req_with_headers

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          token: token)
      @endpoints = Endpoints::Client.new(request_client: @request_client)
      @inlined_requests = InlinedRequestsClient.new(request_client: @request_client)
      @no_auth = NoAuthClient.new(request_client: @request_client)
      @no_req_body = NoReqBodyClient.new(request_client: @request_client)
      @req_with_headers = ReqWithHeadersClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :endpoints, :inlined_requests, :no_auth, :no_req_body, :req_with_headers

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     token: token)
      @endpoints = Endpoints::AsyncClient.new(request_client: @async_request_client)
      @inlined_requests = AsyncInlinedRequestsClient.new(request_client: @async_request_client)
      @no_auth = AsyncNoAuthClient.new(request_client: @async_request_client)
      @no_req_body = AsyncNoReqBodyClient.new(request_client: @async_request_client)
      @req_with_headers = AsyncReqWithHeadersClient.new(request_client: @async_request_client)
    end
  end
end
