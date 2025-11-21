# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param api_key [String]
    #
    # @return [void]
    def initialize(base_url:, api_key: ENV.fetch("FERN_API_KEY", nil))
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_auth-environment-variables/0.0.1",
          "X-Fern-Language": "Ruby",
          "X-FERN-API-KEY": api_key.to_s
        }
      )
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
