# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param custom_auth_scheme [String]
    #
    # @return [void]
    def initialize(base_url:, custom_auth_scheme:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_custom-auth/0.0.1",
          "X-Fern-Language": "Ruby",
          "X-API-KEY": custom_auth_scheme.to_s
        }
      )
    end

    # @return [Seed::CustomAuth::Client]
    def custom_auth
      @custom_auth ||= Seed::CustomAuth::Client.new(client: @raw_client)
    end
  end
end
