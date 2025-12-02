# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param client_id [String]
    # @param client_secret [String]
    # @param scope [String, nil]
    # @param x_api_key [String]
    #
    # @return [void]
    def initialize(base_url:, client_id:, client_secret:, x_api_key:, scope: nil)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language": "Ruby",
          "X-Client-Id": client_id,
          "X-Client-Secret": client_secret,
          "X-Scope": scope,
          "X-Api-Key": x_api_key
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = Seed::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { client_id: client_id, client_secret: client_secret, scope: scope, x_api_key: x_api_key }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_inferred-auth-implicit-no-expiry/0.0.1",
          "X-Fern-Language": "Ruby"
        }.merge(@auth_provider.get_auth_headers)
      )
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client)
    end

    # @return [Seed::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= Seed::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [Seed::Nested::Client]
    def nested
      @nested ||= Seed::Nested::Client.new(client: @raw_client)
    end

    # @return [Seed::Simple::Client]
    def simple
      @simple ||= Seed::Simple::Client.new(client: @raw_client)
    end
  end
end
