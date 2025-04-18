# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_pagination/complex/client"
require_relative "fern_pagination/users/client"

module SeedPaginationClient
  class Client
    # @return [SeedPaginationClient::ComplexClient]
    attr_reader :complex
    # @return [SeedPaginationClient::UsersClient]
    attr_reader :users

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedPaginationClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedPaginationClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @complex = SeedPaginationClient::ComplexClient.new(request_client: @request_client)
      @users = SeedPaginationClient::UsersClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedPaginationClient::AsyncComplexClient]
    attr_reader :complex
    # @return [SeedPaginationClient::AsyncUsersClient]
    attr_reader :users

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedPaginationClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedPaginationClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @complex = SeedPaginationClient::AsyncComplexClient.new(request_client: @async_request_client)
      @users = SeedPaginationClient::AsyncUsersClient.new(request_client: @async_request_client)
    end
  end
end
