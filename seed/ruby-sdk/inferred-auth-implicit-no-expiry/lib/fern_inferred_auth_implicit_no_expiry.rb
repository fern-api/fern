# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_inferred_auth_implicit_no_expiry/auth/client"
require_relative "fern_inferred_auth_implicit_no_expiry/nested_no_auth/client"
require_relative "fern_inferred_auth_implicit_no_expiry/nested/client"
require_relative "fern_inferred_auth_implicit_no_expiry/simple/client"

module SeedInferredAuthImplicitNoExpiryClient
  class Client
    # @return [SeedInferredAuthImplicitNoExpiryClient::AuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::Client]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::Client]
    attr_reader :nested
    # @return [SeedInferredAuthImplicitNoExpiryClient::SimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthImplicitNoExpiryClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedInferredAuthImplicitNoExpiryClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthImplicitNoExpiryClient::AuthClient.new(request_client: @request_client)
      @nested_no_auth = SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::Client.new(request_client: @request_client)
      @nested = SeedInferredAuthImplicitNoExpiryClient::Nested::Client.new(request_client: @request_client)
      @simple = SeedInferredAuthImplicitNoExpiryClient::SimpleClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedInferredAuthImplicitNoExpiryClient::AsyncAuthClient]
    attr_reader :auth
    # @return [SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::AsyncClient]
    attr_reader :nested_no_auth
    # @return [SeedInferredAuthImplicitNoExpiryClient::Nested::AsyncClient]
    attr_reader :nested
    # @return [SeedInferredAuthImplicitNoExpiryClient::AsyncSimpleClient]
    attr_reader :simple

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedInferredAuthImplicitNoExpiryClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedInferredAuthImplicitNoExpiryClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @auth = SeedInferredAuthImplicitNoExpiryClient::AsyncAuthClient.new(request_client: @async_request_client)
      @nested_no_auth = SeedInferredAuthImplicitNoExpiryClient::NestedNoAuth::AsyncClient.new(request_client: @async_request_client)
      @nested = SeedInferredAuthImplicitNoExpiryClient::Nested::AsyncClient.new(request_client: @async_request_client)
      @simple = SeedInferredAuthImplicitNoExpiryClient::AsyncSimpleClient.new(request_client: @async_request_client)
    end
  end
end
