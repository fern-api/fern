# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_query_parameters_client/user/client"

module SeedQueryParametersClient
  class Client
    attr_reader :user

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @user = UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :user

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @user = AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
