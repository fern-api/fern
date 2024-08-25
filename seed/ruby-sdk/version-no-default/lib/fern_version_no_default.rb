# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_version_no_default/user/client"

module SeedVersionClient
  class Client
    # @return [SeedVersionClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedVersionClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedVersionClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedVersionClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedVersionClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedVersionClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedVersionClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedVersionClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
