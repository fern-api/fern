# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_inferred_auth_implicit/auth/client"
require_relative "fern_inferred_auth_implicit/nested_no_auth/client"
require_relative "fern_inferred_auth_implicit/nested/client"
require_relative "fern_inferred_auth_implicit/simple/client"

module SeedInferredAuthImplicitClient
  class Client
    # @return [SeedInferredAuthImplicitClient::AuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthImplicitClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthImplicitClient::Nested::Client]
    attr_reader :nested
    # @return [SeedInferredAuthImplicitClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthImplicitClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedInferredAuthImplicitClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthImplicitClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedInferredAuthImplicitClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedInferredAuthImplicitClient::Nested::Client.new(request_client: @request_client)
      @simple = SeedInferredAuthImplicitClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedInferredAuthImplicitClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthImplicitClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthImplicitClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedInferredAuthImplicitClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthImplicitClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedInferredAuthImplicitClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthImplicitClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedInferredAuthImplicitClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedInferredAuthImplicitClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @simple = SeedInferredAuthImplicitClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
