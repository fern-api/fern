# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    # @param api_key [String]
    # @param client_id [String, nil]
    # @param client_secret [String, nil]
    # @param username [String]
    # @param password [String]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, token: ENV.fetch("MY_TOKEN", nil), api_key: ENV.fetch("MY_API_KEY", nil), client_id: nil, client_secret: nil, username: nil, password: nil, max_retries: 2)
      explicit_oauth_auth = !client_id.nil? || !client_secret.nil?
      explicit_basic_auth = !username.nil? || !password.nil?
      client_id = ENV.fetch("MY_CLIENT_ID", nil) if client_id.nil?
      client_secret = ENV.fetch("MY_CLIENT_SECRET", nil) if client_secret.nil?
      username = ENV.fetch("MY_USERNAME", nil) if username.nil?
      password = ENV.fetch("MY_PASSWORD", nil) if password.nil?

      if !client_id.to_s.empty? && !client_secret.to_s.empty? && (explicit_oauth_auth || !explicit_basic_auth)
        # Create an unauthenticated client for the auth endpoint
        auth_raw_client = Seed::Internal::Http::RawClient.new(
          base_url: base_url,
          headers: {
            "X-Fern-Language" => "Ruby"
          }
        )

        # Create the auth client for token retrieval
        auth_client = Seed::Auth::Client.new(client: auth_raw_client)

        # Create the OAuth provider with the auth client and credentials
        @auth_provider = Seed::Internal::OAuthProvider.new(
          auth_client: auth_client,
          options: { base_url: base_url, client_id: client_id, client_secret: client_secret }
        )
      end

      headers = {
        "User-Agent" => "fern_any-auth/0.0.1",
        "X-Fern-Language" => "Ruby",
        Authorization: "Bearer #{token}",
        "X-API-Key" => api_key.to_s
      }
      headers["Authorization"] = "Basic #{Base64.strict_encode64("#{username}:#{password}")}" if !username.nil? && !password.nil?
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: headers,
        auth_provider: @auth_provider,
        max_retries: max_retries
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
