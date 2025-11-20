# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    # @param token [String]
    # @param api_key [String]
    #
    # @return [Seed::Client]
    def initialize(base_url:, token: ENV.fetch("MY_TOKEN", nil), api_key: ENV.fetch("MY_API_KEY", nil))
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_any-auth/0.0.1",
          "X-Fern-Language": "Ruby",
          Authorization: "Bearer #{token}",
          "X-API-Key": api_key.to_s
        }
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
