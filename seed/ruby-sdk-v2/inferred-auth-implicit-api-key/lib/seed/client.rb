# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param api_key [String]
    #
    # @return [void]
    def initialize(base_url:, api_key:)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby",
          "X-Api-Key" => api_key
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = Seed::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, api_key: api_key }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_inferred-auth-implicit-api-key/0.0.1",
          "X-Fern-Language" => "Ruby"
        }.merge(@auth_provider.auth_headers)
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
