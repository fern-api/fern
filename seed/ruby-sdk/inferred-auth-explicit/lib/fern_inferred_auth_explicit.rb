# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_inferred_auth_explicit/auth/client"
require_relative "fern_inferred_auth_explicit/nested_no_auth/client"
require_relative "fern_inferred_auth_explicit/nested/client"
require_relative "fern_inferred_auth_explicit/simple/client"

module SeedInferredAuthExplicitClient
  class Client
    # @return [SeedInferredAuthExplicitClient::AuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthExplicitClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthExplicitClient::Nested::Client]
    attr_reader :nested
    # @return [SeedInferredAuthExplicitClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthExplicitClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedInferredAuthExplicitClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthExplicitClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedInferredAuthExplicitClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedInferredAuthExplicitClient::Nested::Client.new(request_client: @request_client)
      @simple = SeedInferredAuthExplicitClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedInferredAuthExplicitClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthExplicitClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthExplicitClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedInferredAuthExplicitClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthExplicitClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedInferredAuthExplicitClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthExplicitClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedInferredAuthExplicitClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedInferredAuthExplicitClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @simple = SeedInferredAuthExplicitClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
