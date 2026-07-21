# frozen_string_literal: true

module Seed
  class Client
    # @param scopes [String]
    # @param tenant [String]
    # @param base_url [String, nil]
    # @param client_id [String, nil]
    # @param client_secret [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(scopes:, tenant:, base_url: nil, client_id: ENV.fetch("ACME_CLIENT_ID", nil), client_secret: ENV.fetch("ACME_CLIENT_SECRET", nil), max_retries: 2)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "X-Fern-Language" => "Ruby"
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Auth::Client.new(client: auth_raw_client)

      # Create the OAuth provider with the auth client and credentials
      @auth_provider = Seed::Internal::OAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, client_id: client_id, client_secret: client_secret, scopes: scopes, tenant: tenant }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_cli-oauth/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        auth_provider: @auth_provider,
        max_retries: max_retries
      )
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client)
    end

    # @return [Seed::System::Client]
    def system
      @system ||= Seed::System::Client.new(client: @raw_client)
    end

    # @return [Seed::Pets::Client]
    def pets
      @pets ||= Seed::Pets::Client.new(client: @raw_client)
    end
  end
end
