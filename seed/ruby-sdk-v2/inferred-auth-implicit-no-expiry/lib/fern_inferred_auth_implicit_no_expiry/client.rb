# frozen_string_literal: true

module FernInferredAuthImplicitNoExpiry
  class Client
    # @param base_url [String, nil]
    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String, nil]
    # @param x_api_key [String]
    #
    # @return [void]
    def initialize(client_id:, client_secret:, x_api_key:, base_url: nil, scope: nil)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = FernInferredAuthImplicitNoExpiry::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby",
          "X-Client-Id" => client_id,
          "X-Client-Secret" => client_secret,
          "X-Scope" => scope,
          "X-Api-Key" => x_api_key
        }
      )

      # Create the auth client for token retrieval
      auth_client = FernInferredAuthImplicitNoExpiry::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = FernInferredAuthImplicitNoExpiry::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, client_id: client_id, client_secret: client_secret, scope: scope, x_api_key: x_api_key }
      )

      @raw_client = FernInferredAuthImplicitNoExpiry::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_inferred-auth-implicit-no-expiry/0.0.1",
          "X-Fern-Language" => "Ruby"
        }.merge(@auth_provider.auth_headers)
      )
    end

    # @return [FernInferredAuthImplicitNoExpiry::Auth::Client]
    def auth
      @auth ||= FernInferredAuthImplicitNoExpiry::Auth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitNoExpiry::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernInferredAuthImplicitNoExpiry::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitNoExpiry::Nested::Client]
    def nested
      @nested ||= FernInferredAuthImplicitNoExpiry::Nested::Client.new(client: @raw_client)
    end

    # @return [FernInferredAuthImplicitNoExpiry::Simple::Client]
    def simple
      @simple ||= FernInferredAuthImplicitNoExpiry::Simple::Client.new(client: @raw_client)
    end
  end
end
