# frozen_string_literal: true

require "faraday"
require_relative "seed_enum_client/inlined_request/client"
require_relative "seed_enum_client/path_param/client"
require_relative "seed_enum_client/query_param/client"
require "async/http/faraday"

module SeedEnumClient
  class Client
    attr_reader :inlined_request_client, :path_param_client, :query_param_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @inlined_request_client = InlinedRequest::InlinedRequestClient.new(request_client: request_client)
      @path_param_client = PathParam::PathParamClient.new(request_client: request_client)
      @query_param_client = QueryParam::QueryParamClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_inlined_request_client, :async_path_param_client, :async_query_param_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_inlined_request_client = InlinedRequest::AsyncInlinedRequestClient.new(request_client: request_client)
      @async_path_param_client = PathParam::AsyncPathParamClient.new(request_client: request_client)
      @async_query_param_client = QueryParam::AsyncQueryParamClient.new(request_client: request_client)
    end
  end
end
