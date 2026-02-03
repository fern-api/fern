# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    # @param api_key [String]
    # @param client_id [String]
    # @param client_secret [String]
    #
    # @return [void]
    def initialize(client_id:, client_secret:, base_url: nil, token: ENV.fetch("MY_TOKEN", nil), api_key: ENV.fetch("MY_API_KEY", nil))
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby",
          "X-Client-Id" => client_id,
          "X-Client-Secret" => client_secret
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Auth::Client.new(client: auth_raw_client)

      # Create the auth provider with the auth client and credentials
      @auth_provider = Seed::Internal::InferredAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, client_id: client_id, client_secret: client_secret }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_endpoint-security-auth/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}",
          "X-API-Key" => api_key.to_s
        }.merge(@auth_provider.auth_headers)
      )
    end

    # @return [Seed::Auth::Client]
    def auth
      @auth ||= Seed::Auth::Client.new(client: @raw_client)
    end

    # @return [Seed::User::Client]
    def user
      @user ||= Seed::User::Client.new(client: @raw_client)
    end
  end
end
