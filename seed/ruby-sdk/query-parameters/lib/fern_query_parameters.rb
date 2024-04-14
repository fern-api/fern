# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_query_parameters/user/client"

module SeedQueryParametersClient
  class Client
    # @return [SeedQueryParametersClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedQueryParametersClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedQueryParametersClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedQueryParametersClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedQueryParametersClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedQueryParametersClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedQueryParametersClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedQueryParametersClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
