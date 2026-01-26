# frozen_string_literal: true

module FernInferredAuthImplicitReference
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = FernInferredAuthImplicitReference::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby"
        }
      )

      # Create the auth client for token retrieval
      auth_client = FernInferredAuthImplicitReference::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = FernInferredAuthImplicitReference::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url }
      )

      @raw_client = FernInferredAuthImplicitReference::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_inferred-auth-implicit-reference/0.0.1",
          "X-Fern-Language" => "Ruby"
        }.merge(@auth_provider.auth_headers)
      )
    end

    # @return [FernInferredAuthImplicitReference::Auth::Client]
    def auth
      @auth ||= FernInferredAuthImplicitReference::Auth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitReference::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernInferredAuthImplicitReference::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitReference::Nested::Client]
    def nested
      @nested ||= FernInferredAuthImplicitReference::Nested::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitReference::Simple::Client]
    def simple
      @simple ||= FernInferredAuthImplicitReference::Simple::Client.new(client: @raw_client)
    end
  end
end
