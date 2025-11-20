# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    # @param token [String]
    #
    # @return [Seed::Client]
    def initialize(base_url:, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_pagination/0.0.1",
          "X-Fern-Language": "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Complex::Client]
    def complex
      @complex ||= Seed::Complex::Client.new(client: @raw_client)
    end

    # @return [Seed::InlineUsers::Client]
    def inline_users
      @inline_users ||= Seed::InlineUsers::Client.new(client: @raw_client)
    end

    # @return [Seed::Users::Client]
    def users
      @users ||= Seed::Users::Client.new(client: @raw_client)
    end
  end
end
