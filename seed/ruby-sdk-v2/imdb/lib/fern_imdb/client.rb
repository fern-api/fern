# frozen_string_literal: true

module FernImdb
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernImdb::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_imdb/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernImdb::Imdb::Client]
    def imdb
      @imdb ||= FernImdb::Imdb::Client.new(client: @raw_client)
    end
  end
end
