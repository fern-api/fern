# frozen_string_literal: true

module Seed
  class Client
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_custom-auth/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::CustomAuth::Client]
    def custom_auth
      @custom_auth ||= Seed::CustomAuth::Client.new(client: @raw_client)
    end
  end
end
