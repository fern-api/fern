# frozen_string_literal: true

module Seed
  class MyClient
    # @param token [String]
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_exhaustive/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::Inlinedrequests::Client]
    def inlinedrequests
      @inlinedrequests ||= Seed::Inlinedrequests::Client.new(client: @raw_client)
    end

    # @return [Seed::Noauth::Client]
    def noauth
      @noauth ||= Seed::Noauth::Client.new(client: @raw_client)
    end

    # @return [Seed::Noreqbody::Client]
    def noreqbody
      @noreqbody ||= Seed::Noreqbody::Client.new(client: @raw_client)
    end

    # @return [Seed::Reqwithheaders::Client]
    def reqwithheaders
      @reqwithheaders ||= Seed::Reqwithheaders::Client.new(client: @raw_client)
    end

    # @return [Seed::Endpoints::Client]
    def endpoints
      @endpoints ||= Seed::Endpoints::Client.new(client: @raw_client)
    end
  end
end
