# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_http_head/user/client"

module SeedHttpHeadClient
  class Client
    # @return [SeedHttpHeadClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedHttpHeadClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedHttpHeadClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedHttpHeadClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedHttpHeadClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedHttpHeadClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedHttpHeadClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @user = SeedHttpHeadClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
