# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_enum_client/inlined_request/client"
require_relative "seed_enum_client/path_param/client"
require_relative "seed_enum_client/query_param/client"

module SeedEnumClient
  class Client
    attr_reader :inlined_request, :path_param, :query_param

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @inlined_request = InlinedRequestClient.new(request_client: @request_client)
      @path_param = PathParamClient.new(request_client: @request_client)
      @query_param = QueryParamClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :inlined_request, :path_param, :query_param

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @inlined_request = AsyncInlinedRequestClient.new(request_client: @async_request_client)
      @path_param = AsyncPathParamClient.new(request_client: @async_request_client)
      @query_param = AsyncQueryParamClient.new(request_client: @async_request_client)
    end
  end
end
