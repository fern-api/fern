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
          "User-Agent" => "fern_unknown/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Unknown::Client]
    def unknown
      @unknown ||= Seed::Unknown::Client.new(client: @raw_client)
    end
  end

  class AsyncClient
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::AsyncRawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_unknown/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [Seed::Unknown::AsyncClient]
    def unknown
      @unknown ||= Seed::Unknown::AsyncClient.new(client: @raw_client)
    end
  end
end
