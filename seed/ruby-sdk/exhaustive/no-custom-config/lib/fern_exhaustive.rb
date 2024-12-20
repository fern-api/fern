# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_exhaustive/endpoints/client"
require_relative "fern_exhaustive/inlined_requests/client"
require_relative "fern_exhaustive/no_auth/client"
require_relative "fern_exhaustive/no_req_body/client"
require_relative "fern_exhaustive/req_with_headers/client"

module SeedExhaustiveClient
  class Client
    # @return [SeedExhaustiveClient::Endpoints::Client]
    attr_reader :endpoints
    # @return [SeedExhaustiveClient::InlinedRequestsClient]
    attr_reader :inlined_requests
    # @return [SeedExhaustiveClient::NoAuthClient]
    attr_reader :no_auth
    # @return [SeedExhaustiveClient::NoReqBodyClient]
    attr_reader :no_req_body
    # @return [SeedExhaustiveClient::ReqWithHeadersClient]
    attr_reader :req_with_headers

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExhaustiveClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedExhaustiveClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @endpoints = SeedExhaustiveClient::Endpoints::Client.new(request_client: @request_client)
      @inlined_requests = SeedExhaustiveClient::InlinedRequestsClient.new(request_client: @request_client)
      @no_auth = SeedExhaustiveClient::NoAuthClient.new(request_client: @request_client)
      @no_req_body = SeedExhaustiveClient::NoReqBodyClient.new(request_client: @request_client)
      @req_with_headers = SeedExhaustiveClient::ReqWithHeadersClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedExhaustiveClient::Endpoints::AsyncClient]
    attr_reader :endpoints
    # @return [SeedExhaustiveClient::AsyncInlinedRequestsClient]
    attr_reader :inlined_requests
    # @return [SeedExhaustiveClient::AsyncNoAuthClient]
    attr_reader :no_auth
    # @return [SeedExhaustiveClient::AsyncNoReqBodyClient]
    attr_reader :no_req_body
    # @return [SeedExhaustiveClient::AsyncReqWithHeadersClient]
    attr_reader :req_with_headers

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedExhaustiveClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedExhaustiveClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @endpoints = SeedExhaustiveClient::Endpoints::AsyncClient.new(request_client: @async_request_client)
      @inlined_requests = SeedExhaustiveClient::AsyncInlinedRequestsClient.new(request_client: @async_request_client)
      @no_auth = SeedExhaustiveClient::AsyncNoAuthClient.new(request_client: @async_request_client)
      @no_req_body = SeedExhaustiveClient::AsyncNoReqBodyClient.new(request_client: @async_request_client)
      @req_with_headers = SeedExhaustiveClient::AsyncReqWithHeadersClient.new(request_client: @async_request_client)
    end
  end
end
