# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_pagination/users/client"

module SeedPaginationClient
  class Client
    attr_reader :users

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                          token: token)
      @users = UsersClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :users

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(token:, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds,
                                                     token: token)
      @users = AsyncUsersClient.new(request_client: @async_request_client)
    end
  end
end
