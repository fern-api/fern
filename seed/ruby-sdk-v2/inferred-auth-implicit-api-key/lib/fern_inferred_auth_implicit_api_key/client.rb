# frozen_string_literal: true

module FernInferredAuthImplicitApiKey
  class Client
    # @param base_url [String, nil]
    # @param api_key [String]
    #
    # @return [void]
    def initialize(api_key:, base_url: nil)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = FernInferredAuthImplicitApiKey::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby",
          "X-Api-Key" => api_key
        }
      )

      # Create the auth client for token retrieval
      auth_client = FernInferredAuthImplicitApiKey::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = FernInferredAuthImplicitApiKey::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, api_key: api_key }
      )

      @raw_client = FernInferredAuthImplicitApiKey::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_inferred-auth-implicit-api-key/0.0.1",
          "X-Fern-Language" => "Ruby"
        }.merge(@auth_provider.auth_headers)
      )
    end

    # @return [FernInferredAuthImplicitApiKey::Auth::Client]
    def auth
      @auth ||= FernInferredAuthImplicitApiKey::Auth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitApiKey::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernInferredAuthImplicitApiKey::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitApiKey::Nested::Client]
    def nested
      @nested ||= FernInferredAuthImplicitApiKey::Nested::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitApiKey::Simple::Client]
    def simple
      @simple ||= FernInferredAuthImplicitApiKey::Simple::Client.new(client: @raw_client)
    end
  end
end
