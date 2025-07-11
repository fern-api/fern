# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_request_parameters/user/client"

module SeedRequestParametersClient
  class Client
    # @return [SeedRequestParametersClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedRequestParametersClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedRequestParametersClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedRequestParametersClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedRequestParametersClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedRequestParametersClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedRequestParametersClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedRequestParametersClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
