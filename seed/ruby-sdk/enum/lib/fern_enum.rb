# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_enum/inlined_request/client"
require_relative "fern_enum/path_param/client"
require_relative "fern_enum/query_param/client"

module SeedEnumClient
  class Client
    # @return [SeedEnumClient::InlinedRequestClient]
    attr_reader :inlined_request
    # @return [SeedEnumClient::PathParamClient]
    attr_reader :path_param
    # @return [SeedEnumClient::QueryParamClient]
    attr_reader :query_param

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedEnumClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedEnumClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @inlined_request = SeedEnumClient::InlinedRequestClient.new(request_client: @request_client)
      @path_param = SeedEnumClient::PathParamClient.new(request_client: @request_client)
      @query_param = SeedEnumClient::QueryParamClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedEnumClient::AsyncInlinedRequestClient]
    attr_reader :inlined_request
    # @return [SeedEnumClient::AsyncPathParamClient]
    attr_reader :path_param
    # @return [SeedEnumClient::AsyncQueryParamClient]
    attr_reader :query_param

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedEnumClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedEnumClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @inlined_request = SeedEnumClient::AsyncInlinedRequestClient.new(request_client: @async_request_client)
      @path_param = SeedEnumClient::AsyncPathParamClient.new(request_client: @async_request_client)
      @query_param = SeedEnumClient::AsyncQueryParamClient.new(request_client: @async_request_client)
    end
  end
end
