# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param logger [untyped]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil, logger: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_imdb/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        },
        logger: logger
      )
    end

    # @return [Seed::Imdb::Client]
    def imdb
      @imdb ||= Seed::Imdb::Client.new(client: @raw_client)
    end
  end
end
