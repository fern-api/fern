# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String | nil]
    #
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_optional/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

    # @return [Seed::Optional::Client]
    def optional
      @optional ||= Seed::Optional::Client.new(client: @raw_client)
    end
  end
end
