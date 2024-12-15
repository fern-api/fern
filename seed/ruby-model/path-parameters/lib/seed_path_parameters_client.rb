# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_path_parameters_client/user/client"

module SeedPathParametersClient
  class Client
    # @return [SeedPathParametersClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedPathParametersClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedPathParametersClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedPathParametersClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedPathParametersClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedPathParametersClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedPathParametersClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedPathParametersClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
