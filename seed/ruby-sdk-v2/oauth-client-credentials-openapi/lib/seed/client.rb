# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-openapi/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
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
