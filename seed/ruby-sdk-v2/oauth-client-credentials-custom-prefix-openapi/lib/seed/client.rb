# frozen_string_literal: true

module Seed
  class Client
    # @param client_id [String]
    # @param client_secret [String]
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: 2)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby"
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Identity::Client.new(client: auth_raw_client)

      # Create the OAuth provider with the auth client and credentials
      @auth_provider = Seed::Internal::OAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, client_id: client_id, client_secret: client_secret }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-custom-prefix-openapi/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        auth_provider: @auth_provider,
        max_retries: max_retries
      )
    end

    # @return [Seed::Identity::Client]
    def identity
      @identity ||= Seed::Identity::Client.new(client: @raw_client)
    end

    # @return [Seed::Plants::Client]
    def plants
      @plants ||= Seed::Plants::Client.new(client: @raw_client)
    end
  end
end
