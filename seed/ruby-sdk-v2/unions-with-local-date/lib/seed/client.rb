# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_unions-with-local-date/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::Bigunion::Client]
    def bigunion
      @bigunion ||= Seed::Bigunion::Client.new(client: @raw_client)
    end

    # @return [Seed::Types::Client]
    def types
      @types ||= Seed::Types::Client.new(client: @raw_client)
    end

    # @return [Seed::Union::Client]
    def union
      @union ||= Seed::Union::Client.new(client: @raw_client)
    end
  end
end
